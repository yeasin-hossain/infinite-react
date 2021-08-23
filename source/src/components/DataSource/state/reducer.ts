import type { DataSourceState, DataSourceReadOnlyState } from '../types';

import { multisort } from '../../../utils/multisort';
import {
  enhancedFlatten,
  group,
  getPivotColumnsAndColumnGroups,
} from '../../../utils/groupAndPivot';
import { InfiniteTableEnhancedData } from '../../InfiniteTable';

const haveDepsChanged = <StateType>(
  initialState: StateType,
  finalState: StateType,
  deps: (keyof StateType)[],
) => {
  const initialValues = deps.map((k) => (initialState as any)[k]);

  const finalValues = deps.map((k) => (finalState as any)[k]);

  return finalValues.reduce((acc, _, index) => {
    const oldValue = initialValues[index];
    const newValue = finalValues[index];

    return acc || oldValue !== newValue;
  }, false);
};

function toEnhancedData<T>(data: T): InfiniteTableEnhancedData<T> {
  return { data };
}

export function reducer<T>(
  state: DataSourceState<T> & DataSourceReadOnlyState<T>,
) {
  const initialState = state;

  const sortInfo = state.sortInfo;
  const shouldSort = sortInfo.length;

  const sortDepsChanged = haveDepsChanged(initialState, state, [
    'originalDataArray',
    'sortInfo',
  ]);
  const shouldSortAgain =
    shouldSort && (sortDepsChanged || !state.postSortDataArray);

  const groupBy = state.groupRowsBy;
  const pivotBy = state.pivotBy;

  const shouldGroup = groupBy.length || pivotBy.length;
  const groupsDepsChanged = haveDepsChanged(initialState, state, [
    'originalDataArray',
    'groupRowsBy',
    'pivotBy',
    'aggregationReducers',
    'sortInfo',
  ]);

  const shouldGroupAgain =
    shouldGroup && (groupsDepsChanged || !state.postGroupDataArray);

  let dataArray = state.originalDataArray;

  let enhancedDataArray: InfiniteTableEnhancedData<T>[] = [];

  if (shouldSort) {
    dataArray = shouldSortAgain
      ? multisort(sortInfo, [...dataArray])
      : state.postSortDataArray!;

    state.postSortDataArray = dataArray;
  }

  state.groupDeepMap = undefined;

  if (shouldGroup) {
    if (shouldGroupAgain) {
      const groupResult = group(
        {
          groupBy,
          pivot: pivotBy,
          reducers: state.aggregationReducers,
        },
        dataArray,
      );
      const flattenResult = enhancedFlatten(groupResult);

      enhancedDataArray = flattenResult.data;
      state.groupDeepMap = groupResult.deepMap;
      const pivotGroupsAndCols = pivotBy
        ? getPivotColumnsAndColumnGroups<T>(
            groupResult.topLevelPivotColumns!,
            pivotBy.length,
          )
        : undefined;

      state.pivotColumns = pivotGroupsAndCols?.columns;
      state.pivotColumnGroups = pivotGroupsAndCols?.columnGroups;
    } else {
      enhancedDataArray = state.postGroupDataArray!;
    }

    state.postGroupDataArray = enhancedDataArray;
  } else {
    state.groupDeepMap = undefined;
    state.pivotColumns = undefined;
    enhancedDataArray = dataArray.map(toEnhancedData);
  }

  state.dataArray = enhancedDataArray;

  (globalThis as any).state = state;

  return state;
}
