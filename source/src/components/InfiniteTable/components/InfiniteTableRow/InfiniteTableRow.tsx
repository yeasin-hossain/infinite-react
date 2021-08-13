import * as React from 'react';
import { useEffect, useRef } from 'react';

import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { InfiniteTableColumnCell } from './InfiniteTableColumnCell';

import { useRowDOMProps } from './useRowDOMProps';

import { InfiniteTableRowClassName } from './InfiniteTableRowClassName';

import type { InfiniteTableRowProps } from './InfiniteTableRowTypes';
import { RawList } from '../../../RawList';
import { RenderItem } from '../../../RawList/types';

function InfiniteTableRowFn<T>(
  props: InfiniteTableRowProps<T> & React.HTMLAttributes<HTMLDivElement>,
) {
  const {
    rowWidth,
    rowHeight,

    enhancedData,
    rowIndex,
    //TODO continue here receive columnWidth from props
    brain,
    columns,
  } = props;
  const tableContextValue = useInfiniteTable<T>();

  useEffect(() => {
    return () => {};
  }, []);

  const { props: tableProps, domRef: tableDOMRef } = tableContextValue;

  const { domProps } = useRowDOMProps(props, tableProps, tableDOMRef);

  const style = {
    width: rowWidth,
    height: rowHeight,
  };

  const renderCellRef = useRef<any>(null);
  const renderCell: RenderItem = React.useCallback(
    ({ domRef, itemIndex }) => {
      const column = columns[itemIndex];

      return (
        <InfiniteTableColumnCell<T>
          enhancedData={enhancedData}
          virtualized
          rowIndex={rowIndex}
          domRef={domRef}
          column={column}
        />
      );
    },
    [columns, rowIndex], // don't add repaintId here since it would make this out-of-sync with the available columns when columnOrder controlled changes
  );

  if (renderCellRef.current !== renderCell) {
    renderCellRef.current = renderCell;
  }
  // (renderCell as any)._colscount = columns.length;
  // (renderCell as any)._repaintId = repaintId;
  // (globalThis as any).renderCell = renderCell;

  if (__DEV__) {
    (domProps as any)['data-cmp-name'] = 'ITableRow';
  }

  return (
    <div {...domProps} style={style}>
      <RawList
        brain={brain}
        renderItem={renderCell}
        debugChannel={`${rowIndex}`}
      />
    </div>
  );
}

export const InfiniteTableRow = React.memo(
  InfiniteTableRowFn,
) as typeof InfiniteTableRowFn;

export { InfiniteTableRowClassName };
