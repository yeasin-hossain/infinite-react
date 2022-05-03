import { CSSProperties } from 'react';

import { InfiniteTableComputedColumn } from '../..';
import { Renderable } from '../../../types/Renderable';
import { OnResizeFn } from '../../../types/Size';
import {
  InfiniteTableRowInfo,
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTablePropRowStyle,
  InfiniteTablePropRowClassName,
} from '../../types';
import { InfiniteTableToggleGroupRowFn } from '../../types/InfiniteTableColumn';

export type InfiniteTableCellProps<T> = {
  column: InfiniteTableComputedColumn<T>;
  renderChildren: () => Renderable;

  width: number;
  cssEllipsis?: boolean;
  // children: Renderable;
  virtualized?: boolean;
  skipColumnShifting?: boolean;

  beforeChildren?: Renderable;
  afterChildren?: Renderable;

  offset?: number;
  offsetProperty?: 'left' | 'right';
  cssPosition?: CSSProperties['position'];
  domRef?: React.RefCallback<HTMLElement>;
  cellType: 'body' | 'header';
};

export interface InfiniteTableColumnCellProps<T>
  extends Omit<
    InfiniteTableCellProps<T>,
    'children' | 'cellType' | 'renderChildren'
  > {
  onMouseEnter?: VoidFunction;
  onMouseLeave?: VoidFunction;
  showZebraRows: boolean;
  virtualized: boolean;
  hidden: boolean;
  rowInfo: InfiniteTableRowInfo<T>;
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  getData: () => InfiniteTableRowInfo<T>[];
  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  rowIndex: number;
  rowHeight: number;
  rowStyle: InfiniteTablePropRowStyle<T>;
  rowClassName: InfiniteTablePropRowClassName<T>;
}

export interface InfiniteTableHeaderCellProps<T>
  extends Omit<
    InfiniteTableCellProps<T>,
    'children' | 'cellType' | 'renderChildren'
  > {
  columns: Map<string, InfiniteTableComputedColumn<T>>;
  height: number;
  onResize?: OnResizeFn;
}
