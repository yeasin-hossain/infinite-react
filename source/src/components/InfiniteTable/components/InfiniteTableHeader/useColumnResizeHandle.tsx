import * as React from 'react';
import { useCallback } from 'react';
import { computeResize } from '../../../flexbox';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import {
  InfiniteTableComputedColumn,
  InfiniteTablePropColumnSizing,
} from '../../types';
import {
  setInfiniteColumnOffset,
  setInfiniteColumnWidth,
  setInfiniteVarOnRoot,
} from '../../utils/infiniteDOMUtils';
import { ResizeHandle } from './ResizeHandle';

export function useColumnResizeHandle<T>(
  column: InfiniteTableComputedColumn<T>,
) {
  const {
    computed: { computedVisibleColumns },
    componentState: { domRef },
    getState,
    getComputed,
    componentActions,
  } = useInfiniteTable<T>();
  const computeResizeForDiff = useCallback(
    ({
      diff,
      shareSpaceOnResize,
    }: {
      diff: number;
      shareSpaceOnResize: boolean;
    }) => {
      const state = getState();
      const {
        columnSizing,
        viewportReservedWidth,
        bodySize,
        activeCellIndex,
        brain,
      } = state;

      const columns = getComputed().computedVisibleColumns;

      let atLeastOneFlex = false;

      const columnSizingWithFlex = columns.reduce((acc, col) => {
        if (col.computedFlex) {
          acc[col.id] = { flex: col.computedWidth }; // we explicitly need to have here `{ flex: col.computedWidth }` and not `{ flex: col.computedFlex }`
          // this is to make the test #advancedcolumnresizing work

          atLeastOneFlex = true;
        }
        return acc;
      }, {} as InfiniteTablePropColumnSizing);

      const columnSizingForResize = atLeastOneFlex
        ? {
            // #advancedcolumnresizing-important
            // yep, this order is correct - first current columnSizing from state
            ...columnSizing,

            // and then for flex columns, we override with actual computed widths from above
            ...columnSizingWithFlex,
          }
        : columnSizing;

      const result = computeResize({
        shareSpaceOnResize,
        availableSize: bodySize.width,
        reservedWidth: viewportReservedWidth || 0,
        dragHandleOffset: diff,
        dragHandlePositionAfter: column.computedVisibleIndex,
        columnSizing: columnSizingForResize,
        items: columns.map((c) => {
          return {
            id: c.id,
            computedFlex: c.computedFlex,
            computedWidth: c.computedWidth,
            computedMinWidth: c.computedMinWidth,
            computedMaxWidth: c.computedMaxWidth,
          };
        }),
      });

      if (
        activeCellIndex &&
        activeCellIndex[1] >= column.computedVisibleIndex
      ) {
        const activeColumn = columns[activeCellIndex[1]];
        const currentColumn = columns[column.computedVisibleIndex];

        if (activeCellIndex[1] === currentColumn.computedVisibleIndex) {
          setInfiniteVarOnRoot(
            'activeCellWidth',
            `${currentColumn.computedWidth + result.adjustedDiff}px`,
            domRef.current,
          );
          setInfiniteColumnWidth(
            currentColumn.computedVisibleIndex,
            currentColumn.computedWidth + result.adjustedDiff,
            domRef.current,
          );
        } else if (activeColumn) {
          setInfiniteVarOnRoot(
            'activeCellColumnTransformX',
            `${
              -brain.getScrollPosition().scrollLeft +
              activeColumn.computedOffset +
              result.adjustedDiff
            }px`,
            domRef.current,
          );
          setInfiniteColumnOffset(
            activeColumn.computedVisibleIndex,
            activeColumn.computedOffset + result.adjustedDiff,
            domRef.current,
          );
        }

        if (
          shareSpaceOnResize &&
          activeCellIndex[1] === currentColumn.computedVisibleIndex + 1 &&
          activeColumn
        ) {
          setInfiniteVarOnRoot(
            'activeCellWidth',
            `${activeColumn.computedWidth - result.adjustedDiff}px`,
            domRef.current,
          );
          setInfiniteColumnWidth(
            activeColumn.computedVisibleIndex,
            activeColumn.computedWidth - result.adjustedDiff,
            domRef.current,
          );
        }
      }

      return result;
    },
    [],
  );

  const onColumnResize = useCallback(
    ({
      diff,
      shareSpaceOnResize,
    }: {
      diff: number;
      shareSpaceOnResize: boolean;
    }) => {
      const { columnSizing, reservedWidth } = computeResizeForDiff({
        diff,
        shareSpaceOnResize,
      });

      if (!shareSpaceOnResize) {
        componentActions.viewportReservedWidth = reservedWidth;
      }
      componentActions.columnSizing = columnSizing;
    },
    [],
  );

  const resizeHandle = column.computedResizable ? (
    <ResizeHandle
      columns={computedVisibleColumns}
      columnIndex={column.computedVisibleIndex}
      computeResize={computeResizeForDiff}
      onResize={onColumnResize}
    />
  ) : null;

  return resizeHandle;
}
