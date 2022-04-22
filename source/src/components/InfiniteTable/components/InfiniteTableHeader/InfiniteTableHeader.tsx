import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { join } from '../../../../utils/join';
import { RawTable } from '../../../HeadlessTable/RawTable';
import {
  TableRenderCellFn,
  TableRenderCellFnParam,
} from '../../../HeadlessTable/ReactHeadlessTableRenderer';
import { ScrollPosition } from '../../../types/ScrollPosition';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { internalProps } from '../../internalProps';
import { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';

import { HeaderClsRecipe } from './header.css';
import { InfiniteTableHeaderCell } from './InfiniteTableHeaderCell';
import { InfiniteTableHeaderGroup } from './InfiniteTableHeaderGroup';
import type { InfiniteTableHeaderProps } from './InfiniteTableHeaderTypes';

// import { transformTranslateZero } from '../../utilities.css';

const { rootClassName } = internalProps;

export const TableHeaderClassName = `${rootClassName}Header`;

function InfiniteTableHeaderFn<T>(
  props: InfiniteTableHeaderProps<T> & React.HTMLAttributes<HTMLDivElement>,
) {
  const {
    brain,
    columns,
    style,
    className,
    headerHeight,
    columnAndGroupTreeInfo,

    columnGroupsMaxDepth,
  } = props;

  const {
    computed,
    componentState: { headerBrain },
  } = useInfiniteTable<T>();

  const { computedVisibleColumnsMap } = computed;

  useEffect(() => {
    const onScroll = (scrollPosition: ScrollPosition) => {
      if (domRef.current) {
        domRef.current.style.transform = `translate3d(-${scrollPosition.scrollLeft}px, 0px, 0px)`;
      }
    };

    const removeOnScroll = brain.onScroll(onScroll);

    return removeOnScroll;
  }, [brain]);

  const domRef = useRef<HTMLDivElement | null>(null);

  const headerCls = HeaderClsRecipe({
    overflow: false,
    virtualized: true,
  });

  const domProps: React.HTMLProps<HTMLDivElement> = {
    ref: domRef,
    className: join(
      TableHeaderClassName,

      `${TableHeaderClassName}--virtualized`,
      className,
      headerCls,
    ),
    style: { ...style, height: headerHeight },
  };

  const renderCell: TableRenderCellFn = useCallback(
    (params: TableRenderCellFnParam) => {
      const {
        rowIndex,
        colIndex,
        domRef,
        height,
        widthWithColspan,
        heightWithRowspan,
        hidden,
      } = params;

      const column = columns[colIndex];
      if (!column || hidden) {
        return null;
      }
      const colGroupItem = columnAndGroupTreeInfo
        ? columnAndGroupTreeInfo.pathsToCells.get([rowIndex, colIndex])
        : null;

      if (colGroupItem && colGroupItem.type === 'group') {
        const columns = colGroupItem.columnItems.map((item) => item.ref);
        const computedColumnGroup: InfiniteTableComputedColumnGroup = {
          ...colGroupItem.ref,
          id: colGroupItem.id,
          uniqueGroupId: colGroupItem.uniqueGroupId,
          depth: colGroupItem.depth,
          columns: columns.map((c) => c.id),
          computedWidth: colGroupItem.computedWidth,
          groupOffset: colGroupItem.groupOffset,
        };

        return (
          <InfiniteTableHeaderGroup
            domRef={domRef}
            columns={columns}
            width={widthWithColspan}
            height={height}
            columnGroup={computedColumnGroup}
          />
        );
      }

      return (
        <InfiniteTableHeaderCell<T>
          domRef={domRef}
          column={column}
          width={widthWithColspan}
          height={heightWithRowspan}
          columns={computedVisibleColumnsMap}
        />
      );
    },

    // leave headerHeight here, as it's needed even
    // though it's not directly used inside the fn
    // but it can change - eg, when the corresponding CSS variable  changes
    // do it needs to trigger a re-render
    [columns, headerHeight, columnAndGroupTreeInfo, columnGroupsMaxDepth],
  );

  return (
    <div {...domProps}>
      <RawTable
        renderCell={renderCell}
        brain={headerBrain}
        cellHoverClassNames={[]}
      />
    </div>
  );
}

export const InfiniteTableHeader = React.memo(
  InfiniteTableHeaderFn,
) as typeof InfiniteTableHeaderFn;
