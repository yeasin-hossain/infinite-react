import * as React from 'react';

import { join } from '../../../../utils/join';

import { InfiniteTableHeaderCell } from './InfiniteTableHeaderCell';

import { useInfiniteTable } from '../../hooks/useInfiniteTable';

import { internalProps } from '../../internalProps';
import { InfiniteTableHeaderUnvirtualizedProps } from './InfiniteTableHeaderTypes';
import { renderColumnHeaderGroups } from './renderColumnHeaderGroups';
import { useEffect } from 'react';
import { ScrollPosition } from '../../../types/ScrollPosition';
import { display, flexFlow } from '../../utilities.css';
import { HeaderClsRecipe } from './header.css';

const { rootClassName } = internalProps;
export const TableHeaderClassName = `${rootClassName}Header`;

const UPDATE_SCROLL = (node: HTMLElement, scrollPosition: ScrollPosition) => {
  node.style.transform = `translate3d(${-scrollPosition.scrollLeft}px, 0px, 0px)`;
};

function InfiniteTableHeaderUnvirtualizedFn<T>(
  props: InfiniteTableHeaderUnvirtualizedProps<T> &
    React.HTMLAttributes<HTMLDivElement>,
) {
  const {
    columns,
    scrollable,

    brain,
    scrollListener,
    pinning,
    totalWidth,
    availableWidth,
    ...domProps
  } = props;

  const {
    componentState: {
      computedColumnGroups,

      columnGroupsDepthsMap,
      columnGroupsMaxDepth,
      headerHeight,
    },
    computed: { computedVisibleColumnsMap: columnsMap },
  } = useInfiniteTable<T>();

  const domRef = React.useRef<HTMLDivElement | null>(null);
  const hasColumnGroups = computedColumnGroups.size > 0;

  const columnHeaderGroups = React.useMemo(() => {
    return hasColumnGroups
      ? renderColumnHeaderGroups<T>({
          columnGroups: computedColumnGroups,
          columnGroupsDepthsMap,
          columnGroupsMaxDepth,
          columns,
          headerHeight,
          allVisibleColumns: columnsMap,
        })
      : null;
  }, [
    columnGroupsDepthsMap,
    computedColumnGroups,
    columns,
    columnsMap,
    hasColumnGroups,
    headerHeight,
    columnGroupsMaxDepth,
  ]);

  const children = hasColumnGroups
    ? columnHeaderGroups
    : columns.map((c) => {
        return (
          <InfiniteTableHeaderCell<T>
            key={c.id}
            headerHeight={headerHeight}
            column={c}
            columns={columnsMap}
            virtualized={false}
          />
        );
      });

  const style = { ...domProps?.style };

  if (totalWidth != null) {
    style.width = availableWidth;
  }

  useEffect(() => {
    const scroller = brain || scrollListener;

    if (!scroller || !scrollable) {
      return;
    }

    const onScroll = (scrollPosition: ScrollPosition) => {
      if (domRef.current) {
        UPDATE_SCROLL(domRef.current, scrollPosition);
      }
    };

    const removeOnScroll = scroller!.onScroll(onScroll);

    return removeOnScroll;
  }, [brain, scrollListener]);

  return (
    <div
      {...domProps}
      className={join(
        TableHeaderClassName,
        `${TableHeaderClassName}--unvirtualized`,
        pinning
          ? `${TableHeaderClassName}--pinned ${TableHeaderClassName}-${pinning}`
          : '',
        scrollable ? `${TableHeaderClassName}--overflow` : '',
        domProps.className,
        HeaderClsRecipe({
          pinned: pinning,
          virtualized: false,
          overflow: scrollable,
        }),
      )}
      style={style}
    >
      <div
        style={{ width: totalWidth }}
        className={join(flexFlow.row, display.flex)}
        ref={domRef}
      >
        {children}
      </div>
    </div>
  );
}

export const InfiniteTableHeaderUnvirtualized = React.memo(
  InfiniteTableHeaderUnvirtualizedFn,
) as typeof InfiniteTableHeaderUnvirtualizedFn;
