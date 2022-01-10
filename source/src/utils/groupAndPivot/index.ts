import { GroupRowsState } from '../../components/DataSource/GroupRowsState';
import {
  InfiniteTableColumn,
  InfiniteTablePivotColumn,
  InfiniteTablePivotFinalColumn,
  InfiniteTablePivotFinalColumnGroup,
} from '../../components/InfiniteTable/types/InfiniteTableColumn';
import {
  InfiniteTableColumnGroup,
  InfiniteTableGroupColumnBase,
} from '../../components/InfiniteTable/types/InfiniteTableProps';
import { DeepMap } from '../DeepMap';

export type AggregationReducer<T, AggregationResultType> = {
  id: string;
  field?: keyof T;
  initialValue: AggregationResultType;
  getter: (data: T) => any;
  reducer: (
    accumulator: any,
    value: any,
    data: T,
  ) => AggregationResultType | any;
  done?: (
    accumulatedValue: AggregationResultType | any,
    array: T[],
  ) => AggregationResultType;
};

export type AggregationReducerResult<AggregationResultType extends any = any> =
  {
    value: AggregationResultType;
    id: string;
  };

function DEFAULT_TO_KEY<T>(value: T): T {
  return value;
}

export interface InfiniteTableRowInfo<T> {
  id: any;
  data: T | null;
  groupData?: T[];
  value?: any;
  isGroupRow?: boolean;
  collapsed: boolean;
  collapsedChildrenCount?: number;
  collapsedGroupsCount?: number;
  groupNesting?: number;
  groupKeys?: any[];
  parents?: InfiniteTableEnhancedGroupInfo<T>[];
  indexInParentGroups?: number[];
  indexInGroup: number;
  indexInAll: number;
  groupCount?: number;
  groupBy?: (keyof T)[];
  pivotValuesMap?: PivotValuesDeepMap<T, any>;
  reducerResults?: AggregationReducerResult[];
}

export interface InfiniteTableEnhancedGroupInfo<T>
  extends InfiniteTableRowInfo<T> {
  data: null;
  groupData: T[];
  value: any;
  isGroupRow: true;
  collapsedChildrenCount: number;
  collapsedGroupsCount: number;
  groupNesting: number;
  groupKeys?: any[];
  groupCount: number;
  groupBy: (keyof T)[];
  pivotValuesMap?: PivotValuesDeepMap<T, any>;
}

export type GroupKeyType<T extends any = any> = T; //string | number | symbol | null | undefined;

type PivotReducerResults<T = any> = AggregationReducerResult<T>[];

type PivotGroupValueType<DataType, KeyType> = {
  reducerResults: PivotReducerResults<KeyType>;
  items: DataType[];
};

export type PivotValuesDeepMap<DataType, KeyType> = DeepMap<
  GroupKeyType<KeyType>,
  PivotGroupValueType<DataType, KeyType>
>;

export type DeepMapGroupValueType<DataType, KeyType> = {
  items: DataType[];
  reducerResults: any[];
  pivotDeepMap?: DeepMap<
    GroupKeyType<KeyType>,
    PivotGroupValueType<DataType, KeyType>
  >;
};

export type GroupBy<DataType, KeyType> = {
  field: keyof DataType;
  toKey?: (value: any, data: DataType) => GroupKeyType<KeyType>;
  column?: Partial<InfiniteTableGroupColumnBase<DataType>>;
};

export type PivotBy<DataType, KeyType> = Omit<
  GroupBy<DataType, KeyType>,
  'column'
> & {
  column?:
    | InfiniteTableColumn<DataType>
    | (({
        column,
      }: {
        column: InfiniteTablePivotFinalColumn<DataType, KeyType>;
      }) => Partial<InfiniteTablePivotColumn<DataType>>);
  columnGroup?:
    | InfiniteTableColumnGroup
    | (({
        columnGroup,
      }: {
        columnGroup: InfiniteTablePivotFinalColumnGroup<DataType, KeyType>;
      }) => Partial<InfiniteTablePivotFinalColumnGroup<DataType>>);
};

type GroupParams<DataType, KeyType> = {
  groupBy: GroupBy<DataType, KeyType>[];
  defaultToKey?: (value: any, item: DataType) => GroupKeyType<KeyType>;
  pivot?: PivotBy<DataType, KeyType>[];
  reducers?: AggregationReducer<DataType, any>[];
};

export type DataGroupResult<DataType, KeyType extends any> = {
  deepMap: DeepMap<
    GroupKeyType<KeyType>,
    DeepMapGroupValueType<DataType, KeyType>
  >;
  groupParams: GroupParams<DataType, KeyType>;
  initialData: DataType[];
  reducerResults?: AggregationReducerResult[];
  topLevelPivotColumns?: DeepMap<GroupKeyType<KeyType>, boolean>;
  pivot?: PivotBy<DataType, KeyType>[];
};

function initReducers<DataType>(
  reducers?: AggregationReducer<DataType, any>[],
): AggregationReducerResult[] {
  if (!reducers || !reducers.length) {
    return [];
  }

  return reducers.map((reducer) => ({
    id: reducer.id,
    value: reducer.initialValue,
  }));
}

/**
 *
 * This fn mutates the reducerResults array!!!
 *
 * @param data data item
 * @param reducers an array of reducers
 * @param reducerResults the results on which to operate
 *
 */
function computeReducersFor<DataType>(
  data: DataType,
  reducers: AggregationReducer<DataType, any>[],
  reducerResults: AggregationReducerResult[],
) {
  if (!reducers || !reducers.length) {
    return;
  }

  reducers.forEach((reducer, index) => {
    const currentValue = reducerResults[index].value;

    reducerResults[index] = {
      value: reducer.reducer(currentValue, reducer.getter(data), data),
      id: reducer.id,
    };
  });
}

export function group<DataType, KeyType = any>(
  groupParams: GroupParams<DataType, KeyType>,
  data: DataType[],
): DataGroupResult<DataType, KeyType> {
  const {
    groupBy,
    defaultToKey = DEFAULT_TO_KEY,
    pivot,
    reducers,
  } = groupParams;

  const groupByLength = groupBy.length;

  const topLevelPivotColumns = pivot
    ? new DeepMap<GroupKeyType<KeyType>, boolean>()
    : undefined;

  const deepMap = new DeepMap<
    GroupKeyType<KeyType>,
    DeepMapGroupValueType<DataType, KeyType>
  >();

  let currentGroupKeys: GroupKeyType<KeyType>[] = [];
  let currentPivotKeys: GroupKeyType<KeyType>[] = [];

  const initialReducerValue = initReducers<DataType>(reducers);

  const globalReducerResults = [...initialReducerValue];

  for (let i = 0, len = data.length; i < len; i++) {
    let item = data[i];

    for (let groupByIndex = 0; groupByIndex < groupByLength; groupByIndex++) {
      const { field: groupByProperty, toKey: groupToKey } =
        groupBy[groupByIndex];
      const key: GroupKeyType<KeyType> = (groupToKey || defaultToKey)(
        item[groupByProperty],
        item,
      );

      currentGroupKeys.push(key);

      if (!deepMap.has(currentGroupKeys)) {
        const deepMapGroupValue: DeepMapGroupValueType<DataType, KeyType> = {
          items: [],
          reducerResults: [...initialReducerValue],
        };
        if (pivot) {
          deepMapGroupValue.pivotDeepMap = new DeepMap<
            GroupKeyType<KeyType>,
            PivotGroupValueType<DataType, KeyType>
          >();
        }
        deepMap.set(currentGroupKeys, deepMapGroupValue);
      }

      const {
        items: currentGroupItems,
        reducerResults,
        pivotDeepMap,
      } = deepMap.get(currentGroupKeys)!;

      currentGroupItems.push(item);

      if (reducers) {
        computeReducersFor<DataType>(item, reducers, reducerResults);
      }
      if (pivot) {
        for (
          let pivotIndex = 0, pivotLength = pivot.length;
          pivotIndex < pivotLength;
          pivotIndex++
        ) {
          const { field: pivotField, toKey: pivotToKey } = pivot[pivotIndex];
          const pivotKey: GroupKeyType<KeyType> = (pivotToKey || defaultToKey)(
            item[pivotField],
            item,
          );

          currentPivotKeys.push(pivotKey);
          if (!pivotDeepMap!.has(currentPivotKeys)) {
            topLevelPivotColumns!.set(currentPivotKeys, true);
            pivotDeepMap?.set(currentPivotKeys, {
              reducerResults: [...initialReducerValue],
              items: [],
            });
          }
          const {
            reducerResults: pivotReducerResults,
            items: pivotGroupItems,
          } = pivotDeepMap!.get(currentPivotKeys)!;

          pivotGroupItems.push(item);
          if (reducers) {
            computeReducersFor<DataType>(item, reducers, pivotReducerResults);
          }
        }
        currentPivotKeys.length = 0;
      }
    }

    if (reducers) {
      computeReducersFor<DataType>(item, reducers, globalReducerResults);
    }

    currentGroupKeys.length = 0;
  }

  if (reducers) {
    deepMap.visitDepthFirst(
      (deepMapValue, _keys: KeyType[], _indexInGroup, next) => {
        completeReducers(
          reducers,
          deepMapValue.reducerResults,
          deepMapValue.items,
        );

        if (pivot) {
          // do we need this check
          deepMapValue.pivotDeepMap!.visitDepthFirst(
            (
              { items, reducerResults: pivotReducerResults },
              _keys: KeyType[],
              _indexInGroup,
              next,
            ) => {
              completeReducers(reducers, pivotReducerResults, items);
              next?.();
            },
          );
        }
        next?.();
      },
    );
  }

  if (reducers) {
    completeReducers(reducers, globalReducerResults, data);
  }

  const result: DataGroupResult<DataType, KeyType> = {
    deepMap,
    groupParams,
    initialData: data,

    reducerResults: globalReducerResults,
  };
  if (pivot) {
    result.topLevelPivotColumns = topLevelPivotColumns;
    result.pivot = pivot;
  }

  return result;
}

export function flatten<DataType, KeyType extends any>(
  groupResult: DataGroupResult<DataType, KeyType>,
): DataType[] {
  const { groupParams, deepMap } = groupResult;
  const groupByLength = groupParams.groupBy.length;

  const result: DataType[] = [];

  deepMap.topDownKeys().reduce((acc: DataType[], key) => {
    if (key.length === groupByLength) {
      const items = deepMap.get(key)!.items;
      acc.push(...items);
    }

    return acc;
  }, result);

  return result;
}

type GetEnhancedGroupDataOptions<DataType> = {
  groupKeys: any[];
  groupBy: (keyof DataType)[];
  collapsed: boolean;
  parents: InfiniteTableEnhancedGroupInfo<DataType>[];
  indexInParentGroups: number[];
  indexInGroup: number;
  indexInAll: number;
  reducersMap: Record<string, keyof DataType>;
};

function getEnhancedGroupData<DataType>(
  options: GetEnhancedGroupDataOptions<DataType>,
  deepMapValue: DeepMapGroupValueType<DataType, any>,
) {
  const { groupBy, groupKeys, collapsed, parents, reducersMap } = options;
  const groupNesting = groupKeys.length;
  const { items: groupItems, reducerResults, pivotDeepMap } = deepMapValue;

  let data = null;

  if (reducerResults.length > 0) {
    data = reducerResults.reduce((acc, reducerResult) => {
      const { id } = reducerResult;
      const field = reducersMap[id];
      if (field) {
        acc[field] = reducerResult.value;
      }
      return acc;
    }, {} as Record<keyof DataType, any>);
  }

  const enhancedGroupData: InfiniteTableEnhancedGroupInfo<DataType> = {
    data,
    groupCount: groupItems.length,
    groupData: groupItems,
    groupKeys,
    id: groupKeys,
    collapsed,
    parents,
    collapsedChildrenCount: 0,
    collapsedGroupsCount: 0,
    indexInParentGroups: options.indexInParentGroups,
    indexInGroup: options.indexInGroup,
    indexInAll: options.indexInAll,
    value: groupKeys[groupKeys.length - 1],
    groupBy: groupBy.slice(0, groupNesting) as (keyof DataType)[],
    isGroupRow: true,
    pivotValuesMap: pivotDeepMap,
    groupNesting,
    reducerResults,
  };

  return enhancedGroupData;
}

function completeReducers<DataType>(
  reducers: AggregationReducer<DataType, any>[],
  reducerResults: AggregationReducerResult[],
  items: DataType[],
) {
  if (reducers && reducers.length) {
    reducers?.forEach((reducer: AggregationReducer<DataType, any>, index) => {
      if (reducer.done) {
        reducerResults[index] = {
          value: reducer.done!(reducerResults[index].value, items),
          id: reducer.id,
        };
      }
    });
  }

  return reducerResults;
}

export type EnhancedFlattenParam<DataType, KeyType = any> = {
  groupResult: DataGroupResult<DataType, KeyType>;
  toPrimaryKey: (data: DataType) => any;
  groupRowsState?: GroupRowsState;
  reducers?: AggregationReducer<DataType, any>[];
  generateGroupRows: boolean;
};
export function enhancedFlatten<DataType, KeyType = any>(
  param: EnhancedFlattenParam<DataType, KeyType>,
): { data: InfiniteTableRowInfo<DataType>[] } {
  const { groupResult, toPrimaryKey, groupRowsState, generateGroupRows } =
    param;
  const { groupParams, deepMap, pivot } = groupResult;
  const { groupBy } = groupParams;

  const groupByStrings = groupBy.map((g) => g.field);

  const reducersMap = (param.reducers || []).reduce((acc, reducer) => {
    if (reducer.field) {
      acc[reducer.id] = reducer.field;
    }
    return acc;
  }, {} as Record<string, keyof DataType>);

  const result: InfiniteTableRowInfo<DataType>[] = [];

  const parents: InfiniteTableEnhancedGroupInfo<DataType>[] = [];
  const indexInParentGroups: number[] = [];

  deepMap.visitDepthFirst(
    (deepMapValue, groupKeys: any[], indexInGroup, next?: () => void) => {
      const items = deepMapValue.items;

      const groupNesting = groupKeys.length;

      const collapsed = groupRowsState?.isGroupRowCollapsed(groupKeys) ?? false;

      const enhancedGroupData: InfiniteTableEnhancedGroupInfo<DataType> =
        getEnhancedGroupData(
          {
            groupBy: groupByStrings,
            parents: Array.from(parents),
            reducersMap,
            indexInGroup,
            indexInParentGroups: Array.from(indexInParentGroups),
            indexInAll: result.length,
            groupKeys,
            collapsed,
          },
          deepMapValue,
        );

      const include = generateGroupRows || collapsed;
      if (include) {
        result.push(enhancedGroupData);
      }

      if (collapsed) {
        parents.forEach((parent) => {
          parent.collapsedChildrenCount += enhancedGroupData.groupCount;
          parent.collapsedGroupsCount += 1;
        });
      }

      indexInParentGroups.push(indexInGroup);
      parents.push(enhancedGroupData);

      if (!collapsed) {
        if (!next) {
          if (!pivot) {
            const startIndex = result.length;

            result.push(
              ...items.map((item, index) => {
                return {
                  id: toPrimaryKey(item),
                  data: item,
                  isGroupRow: false,
                  collapsed: false,
                  groupKeys,

                  parents: Array.from(parents),
                  indexInParentGroups: [...indexInParentGroups, index],
                  indexInGroup: index,
                  indexInAll: startIndex + index,
                  groupBy: groupByStrings,
                  groupNesting,
                  groupCount: enhancedGroupData.groupCount,
                };
              }),
            );
          }
        } else {
          next();
        }
      }
      parents.pop();
      indexInParentGroups.pop();
    },
  );

  return {
    data: result,
  };
}
