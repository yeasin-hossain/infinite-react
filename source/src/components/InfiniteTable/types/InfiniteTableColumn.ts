import type { Renderable } from '../../types/Renderable';
import type {
  DataSourceComponentState,
  DataSourceSingleSortInfo,
} from '../../DataSource/types';
import type { DiscriminatedUnion, RequireAtLeastOne } from './Utility';
import type { InfiniteTableEnhancedData } from '.';

export type { DiscriminatedUnion, RequireAtLeastOne };

export interface InfiniteTableColumnRenderParams<DATA_TYPE> {
  // TODO type this to be the type of DATA_TYPE[column.field] if possible
  value: string | number | Renderable | void;
  data: DATA_TYPE | null;
  enhancedData: InfiniteTableEnhancedData<DATA_TYPE>;
  rowIndex: number;
  column: InfiniteTableComputedColumn<DATA_TYPE>;
  groupRowsBy: DataSourceComponentState<DATA_TYPE>['groupRowsBy'];
}

export interface InfiniteTableColumnHeaderRenderParams<T> {
  column: InfiniteTableComputedColumn<T>;
  columnSortInfo: DataSourceSingleSortInfo<T> | null | undefined;
}

export type InfiniteTableColumnPinned = 'start' | 'end' | false;

export type InfiniteTableColumnRenderFunction<DATA_TYPE> = ({
  value,
  rowIndex,
  column,
  data,
  enhancedData,
  groupRowsBy: groupBy,
}: InfiniteTableColumnRenderParams<DATA_TYPE>) => Renderable | null;

export type InfiniteTableColumnHeaderRenderFunction<T> = ({
  columnSortInfo,
  column,
}: InfiniteTableColumnHeaderRenderParams<T>) => Renderable;

export type InfiniteTableColumnWithField<T> = {
  field: keyof T;
};

export type InfiniteTableColumnWithRender<T> = {
  render: InfiniteTableColumnRenderFunction<T>;
};

export type InfiniteTableColumnAlign = 'start' | 'center' | 'end';
export type InfiniteTableColumnVerticalAlign = 'start' | 'center' | 'end';

export type InfiniteTableColumnHeader<T> =
  | Renderable
  | InfiniteTableColumnHeaderRenderFunction<T>;

type InfiniteTableColumnWithFlex = {
  flex?: number;
  defaultFlex?: number;
};

type InfiniteTableColumnWithWidth = {
  width?: number;
  defaultWidth?: number;
};

export type InfiniteTableColumnWithSize = DiscriminatedUnion<
  InfiniteTableColumnWithFlex,
  InfiniteTableColumnWithWidth
>;

export type InfiniteTableColumnTypes = 'string' | 'number' | 'date';

export type InfiniteTableColumnWithRenderOrField<T> = RequireAtLeastOne<
  {
    field?: keyof T;
    render?: InfiniteTableColumnRenderFunction<T>;
  },
  'render' | 'field'
>;

export type InfiniteTableBaseColumn<T> = {
  maxWidth?: number;
  minWidth?: number;

  sortable?: boolean;
  draggable?: boolean;

  align?: InfiniteTableColumnAlign;
  verticalAlign?: InfiniteTableColumnVerticalAlign;
  columnGroup?: string;

  header?: InfiniteTableColumnHeader<T>;
  name?: Renderable;
  cssEllipsis?: boolean;
  headerCssEllipsis?: boolean;
  type?: InfiniteTableColumnTypes;
};
export type InfiniteTableColumn<T> = {} & InfiniteTableBaseColumn<T> &
  InfiniteTableColumnWithRenderOrField<T> &
  InfiniteTableColumnWithSize;

export type InfiniteTableGeneratedColumn<T> = InfiniteTableColumn<T> & {
  groupByField?: string | string[];
};

type InfiniteTableComputedColumnBase<T> = {
  computedWidth: number;
  computedOffset: number;
  computedPinningOffset: number;
  computedAbsoluteOffset: number;
  computedSortable: boolean;
  computedSortInfo: DataSourceSingleSortInfo<T> | null;
  computedSorted: boolean;
  computedSortedAsc: boolean;
  computedSortedDesc: boolean;
  computedSortIndex: number;
  computedVisibleIndex: number;
  computedMultiSort: boolean;

  computedPinned: InfiniteTableColumnPinned;
  computedDraggable: boolean;
  computedFirstInCategory: boolean;
  computedLastInCategory: boolean;
  computedFirst: boolean;
  computedLast: boolean;
  toggleSort: () => void;
  id: string;
};

export type InfiniteTableComputedColumn<T> = InfiniteTableColumn<T> &
  InfiniteTableComputedColumnBase<T> &
  InfiniteTableGeneratedColumn<T>;
