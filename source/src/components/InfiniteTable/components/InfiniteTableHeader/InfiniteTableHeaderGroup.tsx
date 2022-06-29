import * as React from 'react';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { rootClassName } from '../../internalProps';
import { InternalVars } from '../../theme.css';
import { cssEllipsisClassName } from '../../utilities.css';

import { HeaderGroupCls } from './header.css';

import { useColumnGroupResizeHandle } from './useColumnGroupResizeHandle';

import type { InfiniteTableHeaderGroupProps } from './InfiniteTableHeaderTypes';

export const TableHeaderGroupClassName = `${rootClassName}HeaderGroup`;

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

export function InfiniteTableHeaderGroup<T>(
  props: InfiniteTableHeaderGroupProps<T>,
) {
  const { columnGroup, height, columns, bodyBrain, columnGroupsMaxDepth } =
    props;

  let { header } = columnGroup;

  if (header instanceof Function) {
    header = header({
      columnGroup,
    });
  }

  const handle = useColumnGroupResizeHandle(columns, {
    bodyBrain,
    groupHeight: height,
    columnGroup,
    columnGroupsMaxDepth,
  });

  const firstColumn = columns[0];
  const width =
    columns.length > 1
      ? `calc( ` +
        columns
          .map(
            (col) => `var(${columnWidthAtIndex}-${col.computedVisibleIndex})`,
          )
          .join(' + ') +
        ' )'
      : `var(${columnWidthAtIndex}-${firstColumn.computedVisibleIndex})`;

  // the zIndexes are bigger at groups that are at the top
  // also groups to the left have a higher zIndex

  const zIndex = `calc(var(${columnZIndexAtIndex}-${
    firstColumn.computedVisibleIndex
  }) + ${columnGroupsMaxDepth - columnGroup.depth})`;

  return (
    <div
      ref={props.domRef}
      data-group-id={columnGroup.uniqueGroupId}
      className={join(HeaderGroupCls, TableHeaderGroupClassName)}
      style={{ width, height }}
      data-z-index={zIndex}
    >
      <div
        className={join(
          `${TableHeaderGroupClassName}__header-content`,
          cssEllipsisClassName,
        )}
      >
        {header}
      </div>
      {handle}
    </div>
  );
}
