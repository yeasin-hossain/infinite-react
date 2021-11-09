import { InfiniteTableState, InfiniteTableComputedValues } from '../types';

import { DataSourceSingleSortInfo } from '../../DataSource/types';
import { useComputedVisibleColumns } from './useComputedVisibleColumns';

import { sortAscending } from '../../../utils/sortAscending';
import { useCallback, useState } from 'react';
import { useColumnAggregations } from './useColumnAggregations';
import { useComponentState } from '../../hooks/useComponentState';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useColumnGroups } from './useColumnGroups';
import { useGroupAndPivotColumns } from './useGroupAndPivotColumns';

export function useComputed<T>(): InfiniteTableComputedValues<T> {
  const { componentActions, componentState } =
    useComponentState<InfiniteTableState<T>>();

  const {
    componentActions: dataSourceActions,
    componentState: dataSourceState,
  } = useDataSourceContextValue<T>();

  const { columnOrder, columnVisibility, columnPinning, bodySize } =
    componentState;

  useState(() => {
    componentState.onRowHeightCSSVarChange.onChange((rowHeight) => {
      if (rowHeight) {
        componentActions.rowHeight = rowHeight;
      }
    });
    componentState.onHeaderHeightCSSVarChange.onChange((headerHeight) => {
      if (headerHeight) {
        componentActions.headerHeight = headerHeight;
      }
    });
  });

  useColumnAggregations<T>();

  const { multiSort } = dataSourceState;

  useColumnGroups<T>();

  useGroupAndPivotColumns<T>();

  const setSortInfo = useCallback((sortInfo: DataSourceSingleSortInfo<T>[]) => {
    //@ts-ignore
    dataSourceActions.sortInfo = multiSort ? sortInfo : sortInfo[0] ?? null;
    // dataSourceActions.sortInfo = multiSort ? sortInfo : sortInfo[0] ?? null;
  }, []);

  const columns =
    componentState.computedPivotColumns || componentState.computedColumns;

  const {
    computedColumnOrder,
    computedVisibleColumns,
    computedVisibleColumnsMap,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedUnpinnedColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumnsWidth,
    computedUnpinnedOffset,
    computedPinnedEndOffset,
    computedRemainingSpace,
    computedPinnedStartWidth,
    computedPinnedEndWidth,
  } = useComputedVisibleColumns({
    columns,
    generatedColumns: componentState.generatedColumns,
    columnMinWidth: componentState.columnMinWidth,
    columnMaxWidth: componentState.columnMaxWidth,
    columnDefaultWidth: componentState.columnDefaultWidth,
    pinnedStartMaxWidth: componentState.pinnedStartMaxWidth,
    pinnedEndMaxWidth: componentState.pinnedEndMaxWidth,
    bodySize,

    sortable: componentState.sortable,
    draggableColumns: componentState.draggableColumns,
    sortInfo: dataSourceState.sortInfo ?? undefined,
    multiSort,
    setSortInfo,

    columnOrder,

    columnVisibility,
    columnVisibilityAssumeVisible: true, //props.columnVisibilityAssumeVisible,

    columnPinning,
  });

  const unpinnedColumnWidths = computedUnpinnedColumns.map(
    (c) => c.computedWidth,
  );

  // // const columnVirtualBrain = React.useMemo(() => {
  // const brain = new VirtualBrain({
  //   count: columnWidths.length,
  //   itemMainAxisSize: (itemIndex: number) => columnWidths[itemIndex],
  //   mainAxis: 'horizontal',
  // });
  // // }, columnSizes);

  let sortedUnpinnedColumnWidths: number[] = [...unpinnedColumnWidths].sort(
    sortAscending,
  );

  let unpinnedColumnRenderCount = 0;
  let colWidthSum = 0;

  const unpinnedViewportSize =
    bodySize.width -
    computedPinnedEndColumnsWidth -
    computedPinnedStartColumnsWidth;
  while (unpinnedViewportSize > 0 && colWidthSum <= unpinnedViewportSize) {
    colWidthSum += sortedUnpinnedColumnWidths[unpinnedColumnRenderCount];
    unpinnedColumnRenderCount++;
  }
  if (unpinnedViewportSize > 0) {
    unpinnedColumnRenderCount++;
  }
  unpinnedColumnRenderCount = Math.min(
    unpinnedColumnRenderCount,
    computedUnpinnedColumns.length,
  );

  let columnRenderStartIndex = 0;

  const scrollLeft = componentState.scrollPosition.scrollLeft;

  colWidthSum = 0;
  while (colWidthSum < scrollLeft) {
    colWidthSum += unpinnedColumnWidths[columnRenderStartIndex];
    columnRenderStartIndex++;
  }
  if (colWidthSum > scrollLeft) {
    columnRenderStartIndex--;
  }

  const computedPinnedStartOverflow = computedPinnedStartWidth
    ? computedPinnedStartColumnsWidth > computedPinnedStartWidth
    : false;
  const computedPinnedEndOverflow = computedPinnedEndWidth
    ? computedPinnedEndColumnsWidth > computedPinnedEndWidth
    : false;

  return {
    computedPinnedStartOverflow,
    computedPinnedEndOverflow,
    computedPinnedStartWidth,
    computedPinnedEndWidth,
    computedVisibleColumns,
    computedColumnOrder,
    computedRemainingSpace,
    computedVisibleColumnsMap,
    computedColumnVisibility: columnVisibility,
    computedPinnedStartColumns,
    computedPinnedEndColumns,
    computedUnpinnedColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedUnpinnedColumnsWidth,
    computedUnpinnedOffset,
    computedPinnedEndOffset,
    unpinnedColumnRenderCount,
    columnRenderStartIndex,
  };
}
