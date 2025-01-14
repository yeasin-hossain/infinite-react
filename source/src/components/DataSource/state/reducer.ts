import { DataSourceFilterValueItem, DataSourceSetupState } from '..';
import { DeepMap } from '../../../utils/DeepMap';
import {
  InfiniteTableRowInfo,
  InfiniteTable_NoGrouping_RowInfoNormal,
  lazyGroup,
} from '../../../utils/groupAndPivot';
import { enhancedFlatten, group } from '../../../utils/groupAndPivot';
import { getPivotColumnsAndColumnGroups } from '../../../utils/groupAndPivot/getPivotColumnsAndColumnGroups';
import { multisort } from '../../../utils/multisort';
import { rowSelectionStateConfigGetter } from '../../InfiniteTable/api/getSelectionApi';
import { DataSourceCache, DataSourceMutation } from '../DataSourceCache';
import { getCacheAffectedParts } from '../getDataSourceApi';
import { RowSelectionState } from '../RowSelectionState';
import type {
  DataSourceState,
  DataSourceDerivedState,
  LazyRowInfoGroup,
  DataSourcePropFilterFunction,
  DataSourcePropFilterValue,
  DataSourceFilterOperatorFunctionParam,
  DataSourcePropFilterTypes,
} from '../types';
import {
  computeRowInfoReducersFor,
  finishRowInfoReducersFor,
  initRowInfoReducers,
} from './initRowInfoReducers';

export function cleanupEmptyFilterValues<T>(
  filterValue: DataSourceState<T>['filterValue'],

  filterTypes: DataSourceState<T>['filterTypes'],
) {
  if (!filterValue) {
    return filterValue;
  }
  // for remote filters, we don't want to include the values that are empty
  return filterValue.filter((filterValue) => {
    const filterType = filterTypes[filterValue.filter.type];
    if (!filterType) {
      return false;
    }

    if (
      filterType.emptyValues &&
      filterType.emptyValues.includes(filterValue.filter.value)
    ) {
      return false;
    }
    return true;
  });
}

const haveDepsChanged = <StateType>(
  state1: StateType,
  state2: StateType,
  deps: (keyof StateType)[],
) => {
  for (let i = 0, len = deps.length; i < len; i++) {
    const k = deps[i];
    const oldValue = (state1 as any)[k];
    const newValue = (state2 as any)[k];

    if (oldValue !== newValue) {
      return true;
    }
  }
  return false;
};

function toRowInfo<T>(
  data: T,
  id: any,
  index: number,
  isRowSelected?: (rowInfo: InfiniteTableRowInfo<T>) => boolean | null,
): InfiniteTable_NoGrouping_RowInfoNormal<T> {
  const rowInfo: InfiniteTable_NoGrouping_RowInfoNormal<T> = {
    dataSourceHasGrouping: false,
    data,
    id,
    indexInAll: index,
    isGroupRow: false,
    selfLoaded: true,
    rowSelected: false,
  };
  if (isRowSelected) {
    rowInfo.rowSelected = isRowSelected(rowInfo);
  }

  return rowInfo;
}

function filterDataSource<T>(params: {
  dataArray: T[];
  operatorsByFilterType: DataSourceDerivedState<T>['operatorsByFilterType'];
  filterTypes: DataSourcePropFilterTypes<T>;
  filterFunction?: DataSourcePropFilterFunction<T>;
  filterValue?: DataSourcePropFilterValue<T>;
  toPrimaryKey: (data: T, index: number) => any;
}) {
  const {
    filterTypes,

    operatorsByFilterType,
    filterFunction,
    toPrimaryKey,
  } = params;

  let { dataArray } = params;

  if (filterFunction) {
    dataArray = dataArray.filter((data, index, arr) =>
      filterFunction({
        data,
        index,
        dataArray: arr,
        primaryKey: toPrimaryKey(data, index),
      }),
    );
  }

  const filterValueArray =
    cleanupEmptyFilterValues(params.filterValue, filterTypes) || [];

  if (filterValueArray && filterValueArray.length) {
    return dataArray.filter((data, index, arr) => {
      const param = {
        data,
        index,
        dataArray: arr,
        primaryKey: toPrimaryKey(data, index),
        field: undefined as keyof T | undefined,
      };

      for (let i = 0, len = filterValueArray.length; i < len; i++) {
        const currentFilterValue = filterValueArray[i];

        const {
          disabled,
          field,
          valueGetter: filterValueGetter,
          filter: { type: filterTypeKey, value: filterValue, operator },
        } = currentFilterValue;
        const filterType = filterTypes[filterTypeKey];
        if (disabled || !filterType) {
          continue;
        }
        const currentOperator =
          operatorsByFilterType[filterTypeKey]?.[operator];
        if (!currentOperator) {
          continue;
        }

        const valueGetter: DataSourceFilterValueItem<T>['valueGetter'] =
          filterValueGetter || filterType.valueGetter;
        const getter =
          valueGetter || (({ data, field }) => (field ? data[field] : data));

        // this assignment is important
        param.field = field;

        const operatorFnParam =
          param as DataSourceFilterOperatorFunctionParam<T>;

        operatorFnParam.filterValue = filterValue;
        operatorFnParam.currentValue = getter(operatorFnParam);
        operatorFnParam.emptyValues = filterType.emptyValues;

        if (!currentOperator.fn(operatorFnParam)) {
          return false;
        }
      }
      return true;
    });
  }

  return dataArray;
}

export function concludeReducer<T>(params: {
  previousState: DataSourceState<T> & DataSourceDerivedState<T>;
  state: DataSourceState<T> &
    DataSourceDerivedState<T> &
    DataSourceSetupState<T>;
}) {
  const { state, previousState } = params;

  const cacheAffectedParts = getCacheAffectedParts(state);

  const sortInfo = state.sortInfo;
  const sortMode = state.sortMode;
  let shouldSort = !!sortInfo?.length ? sortMode === 'local' : false;

  if (state.lazyLoad || state.livePagination) {
    shouldSort = false;
  }

  let originalDataArrayChanged = haveDepsChanged(previousState, state, [
    'cache',
    'originalDataArray',
    'originalLazyGroupDataChangeDetect',
  ]);

  const dataSourceChange = previousState && state.data !== previousState.data;
  let lazyLoadGroupDataChange =
    state.lazyLoad &&
    previousState &&
    (previousState.groupBy !== state.groupBy ||
      previousState.sortInfo !== state.sortInfo);

  if (dataSourceChange) {
    lazyLoadGroupDataChange = true;
  }

  if (lazyLoadGroupDataChange) {
    state.originalLazyGroupData = new DeepMap<string, LazyRowInfoGroup<T>>();
    originalDataArrayChanged = true;

    // TODO if we have defaultGroupRowsState in props (so this is uncontrolled)
    // reset state.groupRowsState to the value in props.defaultGroupRowsState
    // also make sure onGroupRowsState is triggered to notify the action to consumers
  }

  const cache = state.cache ? DataSourceCache.clone(state.cache) : undefined;
  if (cache && !cache.isEmpty()) {
    originalDataArrayChanged = true;
  }

  const toPrimaryKey = state.toPrimaryKey;

  let mutations: Map<string, DataSourceMutation<T>[]> | undefined;
  const shouldIndex = originalDataArrayChanged;
  if (shouldIndex) {
    state.indexer.clear();

    // why only when not lazyLoad?
    if (!state.lazyLoad) {
      mutations = cache?.getMutations();

      state.originalDataArray = state.indexer.indexArray(
        state.originalDataArray,
        {
          toPrimaryKey,
          cache: cache,
        },
      );
    }
  }
  if (cache) {
    cache.clear();
    state.cache = cache;
  }

  const { filterFunction, filterValue, filterTypes, operatorsByFilterType } =
    state;
  const shouldFilter =
    !!filterFunction || (Array.isArray(filterValue) && filterValue.length);

  const shouldFilterClientSide = shouldFilter && state.filterMode === 'local';

  const filterDepsChanged = haveDepsChanged(previousState, state, [
    'filterFunction',
    'filterValue',
    'filterTypes',
  ]);
  const filterChanged = originalDataArrayChanged || filterDepsChanged;

  const sortInfoChanged = haveDepsChanged(previousState, state, ['sortInfo']);

  const sortDepsChanged =
    originalDataArrayChanged || filterDepsChanged || sortInfoChanged;

  const shouldFilterAgain =
    state.filterMode === 'local' &&
    (filterChanged || !state.lastFilterDataArray);

  const shouldSortAgain =
    shouldSort &&
    (sortDepsChanged ||
      !state.lastSortDataArray ||
      cacheAffectedParts.sortInfo);

  const groupBy = state.groupBy;
  const pivotBy = state.pivotBy;

  const shouldGroup = groupBy.length > 0 || !!pivotBy;
  const selectionDepsChanged = haveDepsChanged(previousState, state, [
    'rowSelection',
    'isRowSelected',
    'originalLazyGroupDataChangeDetect',
  ]);
  const groupsDepsChanged =
    originalDataArrayChanged ||
    sortDepsChanged ||
    haveDepsChanged(previousState, state, [
      'generateGroupRows',
      'originalLazyGroupData',
      'originalLazyGroupDataChangeDetect',
      'groupBy',
      'groupRowsState',
      'pivotBy',
      'aggregationReducers',
      'pivotTotalColumnPosition',
      'pivotGrandTotalColumnPosition',
      'showSeparatePivotColumnForSingleAggregation',
    ]);

  const rowInfoReducersChanged = haveDepsChanged(previousState, state, [
    'rowInfoReducers',
  ]);

  const shouldGroupAgain =
    (shouldGroup &&
      (groupsDepsChanged ||
        !state.lastGroupDataArray ||
        cacheAffectedParts.groupBy)) ||
    selectionDepsChanged ||
    rowInfoReducersChanged;

  const now = Date.now();

  let dataArray = state.originalDataArray;

  if (!shouldFilter) {
    state.unfilteredCount = dataArray.length;
  }
  if (shouldFilterClientSide) {
    state.unfilteredCount = dataArray.length;

    dataArray = shouldFilterAgain
      ? filterDataSource({
          dataArray,
          toPrimaryKey,
          filterTypes,
          operatorsByFilterType,
          filterFunction,
          filterValue,
        })
      : state.lastFilterDataArray!;

    state.lastFilterDataArray = dataArray;
    state.filteredAt = now;
  }

  state.filteredCount = dataArray.length;
  state.postFilterDataArray = dataArray;

  if (shouldSort) {
    const prevKnownTypes = multisort.knownTypes;
    multisort.knownTypes = { ...prevKnownTypes, ...state.sortTypes };

    const sortFn = state.sortFunction || multisort;

    dataArray = shouldSortAgain
      ? sortFn(sortInfo!, [...dataArray])
      : state.lastSortDataArray!;

    multisort.knownTypes = prevKnownTypes;

    state.lastSortDataArray = dataArray;
    state.sortedAt = now;
  }
  state.postSortDataArray = dataArray;

  let rowInfoDataArray: InfiniteTableRowInfo<T>[] = state.dataArray;

  const rowSelectionState =
    state.rowSelection instanceof RowSelectionState
      ? state.rowSelection
      : undefined;

  //@ts-ignore
  rowSelectionState?.xcache();

  let isRowSelected:
    | ((rowInfo: InfiniteTableRowInfo<T>) => boolean | null)
    | undefined =
    state.selectionMode === 'single-row'
      ? (rowInfo) => {
          return rowInfo.id === state.rowSelection;
        }
      : state.selectionMode === 'multi-row'
      ? (rowInfo) => {
          const rowSelection = rowSelectionState as RowSelectionState;

          return rowInfo.isGroupRow
            ? rowSelection.getGroupRowSelectionState(rowInfo.groupKeys)
            : rowSelection.isRowSelected(
                rowInfo.id,
                rowInfo.dataSourceHasGrouping ? rowInfo.groupKeys : undefined,
              );
        }
      : undefined;

  if (state.isRowSelected && state.selectionMode === 'multi-row') {
    isRowSelected = (rowInfo) =>
      state.isRowSelected!(
        rowInfo,
        rowSelectionState as RowSelectionState,
        state.selectionMode as 'multi-row',
      );
  }

  const rowInfoReducers = state.rowInfoReducers!;

  if (shouldGroup) {
    if (shouldGroupAgain) {
      let aggregationReducers = state.aggregationReducers;

      const groupResult = state.lazyLoad
        ? lazyGroup(
            {
              groupBy,
              // groupByIndex: 0,
              // parentGroupKeys: [],
              pivot: pivotBy,
              mappings: state.pivotMappings,
              reducers: aggregationReducers,
              indexer: state.indexer,
              toPrimaryKey,
              cache,
            },
            state.originalLazyGroupData,
          )
        : group(
            {
              groupBy,
              pivot: pivotBy,
              reducers: aggregationReducers,
            },
            dataArray,
          );

      state.groupDeepMap = groupResult.deepMap;
      if (rowSelectionState) {
        rowSelectionState.getConfig = rowSelectionStateConfigGetter(state);
      }

      const rowInfoReducerKeys = Object.keys(
        rowInfoReducers || {},
      ) as (keyof typeof rowInfoReducers)[];

      const rowInfoReducerResults = initRowInfoReducers(
        rowInfoReducers,
      ) as Record<keyof typeof rowInfoReducers, any>;

      const rowInfoReducersShape = {
        reducers: rowInfoReducers,
        results: rowInfoReducerResults,
        reducerKeys: rowInfoReducerKeys,
        rowInfo: {} as InfiniteTableRowInfo<T>,
      };

      const flattenResult = enhancedFlatten({
        groupResult,
        lazyLoad: !!state.lazyLoad,
        reducers: aggregationReducers,
        toPrimaryKey,
        isRowSelected,
        rowSelectionState,

        withRowInfo: rowInfoReducerResults
          ? (rowInfo) => {
              rowInfoReducersShape.rowInfo = rowInfo;
              computeRowInfoReducersFor(rowInfoReducersShape);
            }
          : undefined,

        groupRowsState: state.groupRowsState,
        generateGroupRows: state.generateGroupRows,
      });

      rowInfoDataArray = flattenResult.data;

      state.rowInfoReducerResults = finishRowInfoReducersFor<T>({
        reducers: rowInfoReducers,
        results: rowInfoReducerResults,
        array: rowInfoDataArray,
      });

      state.groupRowsIndexesInDataArray = flattenResult.groupRowsIndexes;
      state.reducerResults = groupResult.reducerResults;

      const pivotGroupsAndCols = pivotBy
        ? getPivotColumnsAndColumnGroups<T>({
            deepMap: groupResult.topLevelPivotColumns!,
            pivotBy,

            pivotTotalColumnPosition: state.pivotTotalColumnPosition ?? 'end',
            pivotGrandTotalColumnPosition:
              state.pivotGrandTotalColumnPosition ?? false,
            reducers: state.aggregationReducers,
            showSeparatePivotColumnForSingleAggregation:
              state.showSeparatePivotColumnForSingleAggregation,
          })
        : undefined;

      state.pivotColumns = pivotGroupsAndCols?.columns;
      state.pivotColumnGroups = pivotGroupsAndCols?.columnGroups;
    } else {
      rowInfoDataArray = state.lastGroupDataArray!;
    }

    state.lastGroupDataArray = rowInfoDataArray;
    state.groupedAt = now;
  } else {
    state.groupDeepMap = undefined;
    state.pivotColumns = undefined;
    state.groupRowsIndexesInDataArray = undefined;
    const arrayDifferentAfterSortStep =
      previousState.postSortDataArray != state.postSortDataArray;

    if (
      arrayDifferentAfterSortStep ||
      groupsDepsChanged ||
      selectionDepsChanged ||
      rowInfoReducersChanged
    ) {
      const rowInfoReducerKeys = Object.keys(
        rowInfoReducers || {},
      ) as (keyof typeof rowInfoReducers)[];

      const rowInfoReducerResults = initRowInfoReducers(
        rowInfoReducers,
      ) as Record<keyof typeof rowInfoReducers, any>;

      const rowInfoReducersShape = {
        reducers: rowInfoReducers,
        results: rowInfoReducerResults,
        reducerKeys: rowInfoReducerKeys,
        rowInfo: {} as InfiniteTableRowInfo<T>,
      };

      rowInfoDataArray = dataArray.map((data, index) => {
        const rowInfo = toRowInfo(
          data,
          data ? toPrimaryKey(data) : index,
          index,
          isRowSelected,
        );

        if (rowInfoReducerResults) {
          rowInfoReducersShape.rowInfo = rowInfo;
          computeRowInfoReducersFor(rowInfoReducersShape);
        }

        return rowInfo;
      });

      state.rowInfoReducerResults = finishRowInfoReducersFor<T>({
        reducers: rowInfoReducers,
        results: rowInfoReducerResults,
        array: rowInfoDataArray,
      });
    }
  }

  state.postGroupDataArray = rowInfoDataArray;

  if (rowInfoDataArray !== state.dataArray) {
    state.updatedAt = now;
  }

  state.dataArray = rowInfoDataArray;
  state.reducedAt = now;

  if (state.selectionMode === 'multi-row') {
    if (shouldGroup && state.lazyLoad) {
      let allRowsSelected = true;
      let someRowsSelected = false;

      state.dataArray.forEach((rowInfo) => {
        if (rowInfo.isGroupRow && rowInfo.groupKeys.length === 1) {
          const { rowSelected } = rowInfo;
          if (rowSelected !== true) {
            allRowsSelected = false;
          }
          if (rowSelected === true || rowSelected === null) {
            someRowsSelected = true;
          }
        }
      });
      state.allRowsSelected = allRowsSelected;
      state.someRowsSelected = someRowsSelected;
    } else {
      const dataArrayCount = state.filteredCount;
      const selectedRowCount =
        (state.rowSelection as RowSelectionState)!.getSelectedCount();

      state.allRowsSelected = dataArrayCount === selectedRowCount;
      state.someRowsSelected = selectedRowCount > 0;
    }
  }

  if (__DEV__) {
    (globalThis as any).state = state;
  }

  state.originalDataArrayChanged = originalDataArrayChanged;

  if (originalDataArrayChanged) {
    state.originalDataArrayChangedInfo = {
      timestamp: now,
      mutations,
    };
  }

  return state;
}
