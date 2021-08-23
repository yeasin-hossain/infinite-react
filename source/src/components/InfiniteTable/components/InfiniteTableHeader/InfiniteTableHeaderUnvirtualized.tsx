import * as React from 'react';

import { join } from '../../../../utils/join';

import { InfiniteTableHeaderCell } from './InfiniteTableHeaderCell';

import { ICSS } from '../../../../style/utilities';

import { useInfiniteTable } from '../../hooks/useInfiniteTable';

import { internalProps } from '../../internalProps';
import { InfiniteTableHeaderUnvirtualizedProps } from './InfiniteTableHeaderTypes';
import { renderColumnHeaderGroups } from './renderColumnHeaderGroups';

const { rootClassName } = internalProps;
export const TableHeaderClassName = `${rootClassName}Header`;

function InfiniteTableHeaderUnvirtualizedFn<T>(
  props: InfiniteTableHeaderUnvirtualizedProps<T> &
    React.HTMLAttributes<HTMLDivElement>,
) {
  const { columns, totalWidth, onResize, ...domProps } = props;

  const {
    componentState: { columnGroups, columnGroupsDepthsMap },
    computed: { computedVisibleColumnsMap: columnsMap },
  } = useInfiniteTable<T>();

  const domRef = React.useRef<HTMLDivElement | null>(null);
  const hasColumnGroups = columnGroups.size > 0;

  const columnHeaderGroups = React.useMemo(() => {
    return hasColumnGroups
      ? renderColumnHeaderGroups<T>({
          columnGroups,
          columnGroupsDepthsMap,
          columns,
          allVisibleColumns: columnsMap,
        })
      : null;
  }, [
    columnGroupsDepthsMap,
    columnGroups,
    columns,
    columnsMap,
    hasColumnGroups,
  ]);

  const children = hasColumnGroups
    ? columnHeaderGroups
    : columns.map((c) => {
        return (
          <InfiniteTableHeaderCell<T>
            key={c.id}
            column={c}
            columns={columnsMap}
            virtualized={false}
          />
        );
      });

  const style = { ...domProps?.style };

  if (totalWidth != null) {
    style.width = totalWidth;
  }
  // style.transform = `translateX(-${scrollLeft ?? 0}px)`;

  return (
    <div
      {...domProps}
      ref={domRef}
      className={join(
        ICSS.flexFlow.row,
        ICSS.display.flex,
        TableHeaderClassName,
        `${TableHeaderClassName}--unvirtualized`,
        domProps.className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export const InfiniteTableHeaderUnvirtualized = React.memo(
  InfiniteTableHeaderUnvirtualizedFn,
) as typeof InfiniteTableHeaderUnvirtualizedFn;
