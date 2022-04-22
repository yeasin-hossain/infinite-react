import * as React from 'react';

import { join } from '../../../../utils/join';
import { rootClassName } from '../../internalProps';
import { cssEllipsisClassName } from '../../utilities.css';

import { HeaderGroupCls } from './header.css';
import type { InfiniteTableHeaderGroupProps } from './InfiniteTableHeaderTypes';

export const TableHeaderGroupClassName = `${rootClassName}HeaderGroup`;

export function InfiniteTableHeaderGroup<T>(
  props: InfiniteTableHeaderGroupProps<T>,
) {
  const { columnGroup, height, width } = props;

  let { header } = columnGroup;

  if (header instanceof Function) {
    header = header({
      columnGroup,
    });
  }

  return (
    <div
      ref={props.domRef}
      data-group-id={columnGroup.uniqueGroupId}
      className={join(HeaderGroupCls, TableHeaderGroupClassName)}
      style={{ width, height }}
    >
      <div
        className={join(
          `${TableHeaderGroupClassName}__header-content`,
          cssEllipsisClassName,
        )}
      >
        {header}
      </div>
    </div>
  );
}
