import * as React from 'react';
import { useCallback } from 'react';

import { getScrollbarWidth } from '../../utils/getScrollbarWidth';
import { RenderRow } from '../../VirtualList/types';
import type { VirtualBrain } from '../../VirtualBrain';

import { VirtualRowList } from '../../VirtualList/VirtualRowList';
import type { Size } from '../../types/Size';
import type {
  InfiniteTableComputedColumn,
  InfiniteTableEnhancedData,
} from '../types';
import type { InfiniteTableRowProps } from '../components/InfiniteTableRow/InfiniteTableRowTypes';

import { InfiniteTableRow } from '../components/InfiniteTableRow';
import { TableRowUnvirtualized } from '../components/InfiniteTableRow/InfiniteTableRowUnvirtualized';
import { InfiniteTableComponentState } from '../types/InfiniteTableState';
import { InfiniteTableToggleGroupRowFn } from '../types/InfiniteTableColumn';

type UnpinnedRenderingParams<T> = {
  columnShifts: number[] | null;
  bodySize: Size;
  getData: () => InfiniteTableEnhancedData<T>[];
  rowHeight: number;
  toggleGroupRow: InfiniteTableToggleGroupRowFn;

  repaintId: string | number;
  applyScrollHorizontal: ({ scrollLeft }: { scrollLeft: number }) => void;
  verticalVirtualBrain: VirtualBrain;
  horizontalVirtualBrain: VirtualBrain;

  computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
  computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];
  computedUnpinnedColumnsWidth: number;
  computedPinnedStartColumnsWidth: number;
  computedPinnedEndColumnsWidth: number;

  getState: () => InfiniteTableComponentState<T>;
};
export function useUnpinnedRendering<T>(params: UnpinnedRenderingParams<T>) {
  const {
    columnShifts,
    bodySize,
    getData,
    rowHeight,
    toggleGroupRow,

    repaintId,

    applyScrollHorizontal,
    verticalVirtualBrain,
    horizontalVirtualBrain,
    computedUnpinnedColumnsWidth,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,

    computedUnpinnedColumns,

    getState,
  } = params;

  const { virtualizeColumns } = getState();

  const shouldVirtualizeColumns =
    typeof virtualizeColumns === 'function'
      ? virtualizeColumns(computedUnpinnedColumns)
      : virtualizeColumns ?? true;

  const renderRowUnpinned: RenderRow = useCallback(
    (rowInfo) => {
      const dataArray = getData();
      const enhancedData = dataArray[rowInfo.rowIndex];

      const { showZebraRows } = getState();

      const rowProps: InfiniteTableRowProps<T> = {
        enhancedData,
        showZebraRows,
        toggleGroupRow,
        virtualizeColumns: shouldVirtualizeColumns,
        brain: null!,
        columns: computedUnpinnedColumns,
        rowWidth: computedUnpinnedColumnsWidth,
        ...rowInfo,
      };
      // console.log('repaint row', rowProps);

      if (shouldVirtualizeColumns) {
        rowProps.brain = horizontalVirtualBrain;
        rowProps.repaintId = repaintId;
      }

      const TableRowComponent = shouldVirtualizeColumns
        ? InfiniteTableRow
        : TableRowUnvirtualized;

      return <TableRowComponent<T> {...rowProps} />;
    },
    [
      repaintId,

      computedUnpinnedColumns,
      computedUnpinnedColumnsWidth,

      shouldVirtualizeColumns,
      horizontalVirtualBrain,
    ],
  );

  const fakeScrollbar = getScrollbarWidth() ? (
    <div
      data-name="horizontal-scrollbar-placeholder--fake"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: getScrollbarWidth() + 1,
        overflow: 'auto',
        visibility: columnShifts ? 'visible' : 'hidden',
      }}
    >
      <div style={{ height: '100%', width: computedUnpinnedColumnsWidth }} />
    </div>
  ) : null;

  return rowHeight != 0 ? (
    <VirtualRowList
      repaintId={`${repaintId}-unpinned-`}
      brain={verticalVirtualBrain}
      onContainerScroll={applyScrollHorizontal}
      scrollable={
        columnShifts
          ? 'visible'
          : { vertical: false, horizontal: !columnShifts }
      }
      style={{
        height: bodySize.height,
        top: 0,
        position: 'absolute',
        left: computedPinnedStartColumnsWidth,
        right: computedPinnedEndColumnsWidth,
      }}
      count={getData().length}
      rowHeight={rowHeight}
      renderRow={renderRowUnpinned}
      rowWidth={computedUnpinnedColumnsWidth}
      outerChildren={fakeScrollbar}
    ></VirtualRowList>
  ) : null;
}
