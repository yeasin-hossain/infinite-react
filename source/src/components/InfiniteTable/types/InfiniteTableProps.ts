import * as React from 'react';
import { InfiniteTableState } from '.';
import {
  AggregationReducer,
  InfiniteTableRowInfoGroup,
  InfiniteTableRowInfoNormal,
} from '../../../utils/groupAndPivot';
import {
  DataSourceGroupBy,
  DataSourcePropGroupBy,
  DataSourcePropPivotBy,
  DataSourceState,
} from '../../DataSource';
import { Renderable } from '../../types/Renderable';
import { LoadMaskProps } from '../components/LoadMask';
import type {
  InfiniteTableColumn,
  InfiniteTableColumnRenderFunction,
  InfiniteTableComputedColumn,
  InfiniteTableComputedPivotFinalColumn,
  InfiniteTablePivotColumn,
  InfiniteTablePivotFinalColumn,
} from './InfiniteTableColumn';
import { InfiniteTablePropPivotTotalColumnPosition } from './InfiniteTableState';

// export type TablePropColumnOrderItem = string | { id: string; visible: boolean };
export type InfiniteTablePropColumnOrderNormalized = string[];
export type InfiniteTablePropColumnOrder =
  | InfiniteTablePropColumnOrderNormalized
  | true;

export type InfiniteTablePropColumnVisibility = Record<string, false>;

export type InfiniteTablePropColumnPinningMap = Map<
  string,
  true | 'start' | 'end'
>;

export type InfiniteTableColumnPinnedValues = false | 'start' | 'end';
export type InfiniteTablePropColumnPinningRecord = Record<
  string,
  true | 'start' | 'end'
>;
export type InfiniteTablePropColumnPinning =
  | InfiniteTablePropColumnPinningRecord
  | InfiniteTablePropColumnPinningMap;

export type InfiniteTableRowStyleFnParams<T> = {
  rowIndex: number;
  groupBy?: (keyof T)[];
} & (
  | {
      data: T;
      rowInfo: InfiniteTableRowInfoNormal<T>;
    }
  | {
      data: Partial<T> | null;
      rowInfo: InfiniteTableRowInfoGroup<T>;
    }
);
export type InfiniteTableRowStyleFn<T> = (
  params: InfiniteTableRowStyleFnParams<T>,
) => undefined | React.CSSProperties;
export type InfiniteTableRowClassNameFn<T> = (
  params: InfiniteTableRowStyleFnParams<T>,
) => string | undefined;
export type InfiniteTablePropRowStyle<T> =
  | React.CSSProperties
  | InfiniteTableRowStyleFn<T>;
export type InfiniteTablePropRowClassName<T> =
  | string
  | InfiniteTableRowClassNameFn<T>;

export type InfiniteTableColumnAggregator<T, AggregationResultType> = Omit<
  AggregationReducer<T, AggregationResultType>,
  'getter' | 'id'
> & {
  getter?: AggregationReducer<T, AggregationResultType>['getter'];
  field?: keyof T;
};

export type InfiniteTableColumnType<T> = {
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  defaultFlex?: number;
  defaultPinned?: InfiniteTableColumnPinnedValues;

  header?: InfiniteTableColumn<T>['header'];
  comparer?: InfiniteTableColumn<T>['comparer'];
  draggable?: InfiniteTableColumn<T>['draggable'];
  sortable?: InfiniteTableColumn<T>['sortable'];
  resizable?: InfiniteTableColumn<T>['resizable'];
  align?: InfiniteTableColumn<T>['align'];
  verticalAlign?: InfiniteTableColumn<T>['verticalAlign'];

  renderValue?: InfiniteTableColumn<T>['renderValue'];
  render?: InfiniteTableColumn<T>['render'];
  valueGetter?: InfiniteTableColumn<T>['valueGetter'];
};
export type InfiniteTablePropColumnTypesMap<T> = Map<
  'default' | string,
  InfiniteTableColumnType<T>
>;
export type InfiniteTablePropColumnTypes<T> =
  | InfiniteTablePropColumnTypesMap<T>
  | Record<'default' | string, InfiniteTableColumnType<T>>;

export type InfiniteTableColumnSizingOptions = {
  flex?: number;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
};
export type InfiniteTablePropColumnSizingMap = Map<
  string,
  InfiniteTableColumnSizingOptions
>;
export type InfiniteTablePropColumnSizing =
  | InfiniteTablePropColumnSizingMap
  | Record<string, InfiniteTableColumnSizingOptions>;

export type InfiniteTableImperativeApi<T> = {
  setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => void;
  setColumnVisibility: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;
  x?: T;
  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
};
export type InfiniteTablePropVirtualizeColumns<T> =
  | boolean
  | ((columns: InfiniteTableComputedColumn<T>[]) => boolean);

export type InfiniteTableInternalProps<T> = {
  rowHeight: number;
  ___t?: T;
};

export type InfiniteTablePropColumnsMap<
  T,
  ColumnType = InfiniteTableColumn<T>,
> = Map<string, ColumnType>;

export type InfiniteTablePropColumns<T, ColumnType = InfiniteTableColumn<T>> =
  | InfiniteTablePropColumnsMap<T, ColumnType>
  | Record<string, ColumnType>;

export type InfiniteTableColumns<T> = InfiniteTablePropColumns<T>;
export type InfiniteTableColumnsMap<T> = InfiniteTablePropColumnsMap<T>;

export type InfiniteTablePropColumnGroupsMap = Map<
  string,
  InfiniteTableColumnGroup
>;
export type InfiniteTablePropColumnGroupsRecord = Record<
  string,
  InfiniteTableColumnGroup
>;
export type InfiniteTablePropColumnGroups =
  | InfiniteTablePropColumnGroupsRecord
  | InfiniteTablePropColumnGroupsMap;

/**
 * the keys is an array of strings: first string in the array is the column group id, next strings are the ids of all columns in the group
 * the value is the id of the column to leave as visible
 */
export type InfiniteTablePropCollapsedColumnGroupsMap = Map<string[], string>;
export type InfiniteTablePropCollapsedColumnGroups = Map<string[], string>;

export type InfiniteTableColumnGroupHeaderRenderParams = {
  columnGroup: InfiniteTableComputedColumnGroup;
};
export type InfiniteTableColumnGroupHeaderRenderFunction = (
  params: InfiniteTableColumnGroupHeaderRenderParams,
) => Renderable;

export type InfiniteTableColumnGroup = {
  columnGroup?: string;
  header?: Renderable | InfiniteTableColumnGroupHeaderRenderFunction;
};
export type InfiniteTableComputedColumnGroup = InfiniteTableColumnGroup & {
  id: string;
  groupOffset: number;
  computedWidth: number;
  uniqueGroupId: string[];
  columns: string[];
  depth: number;
};

export type InfiniteTableGroupColumnGetterOptions<T> = {
  groupIndexForColumn?: number;
  groupByForColumn?: DataSourceGroupBy<T>;
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  groupCount: number;
  groupBy: DataSourceGroupBy<T>[];
};

export type InfiniteTablePivotColumnGetterOptions<
  T,
  COL_TYPE = InfiniteTableColumn<T>,
> = {
  column: COL_TYPE;
  groupBy: DataSourcePropGroupBy<T>;
  pivotBy: DataSourcePropPivotBy<T>;
};

export type InfiniteTablePropGroupRenderStrategy =
  | 'single-column'
  | 'multi-column'
  | 'inline';
export type InfiniteTableGroupColumnBase<T> = InfiniteTableColumn<T> & {
  renderValue?: InfiniteTableColumnRenderFunction<T>;
  id?: string;
};
export type InfiniteTablePivotColumnBase<T> = InfiniteTableColumn<T> & {
  renderValue?: InfiniteTableColumnRenderFunction<
    T,
    InfiniteTableComputedPivotFinalColumn<T>
  >;
  // id?: string;
};
export type InfiniteTablePropGroupColumn<T> =
  | InfiniteTableGroupColumnBase<T>
  | InfiniteTableGroupColumnFunction<T>;

export type InfiniteTableGroupColumnFunction<T> = (
  options: InfiniteTableGroupColumnGetterOptions<T>,
  toggleGroupRow: (groupKeys: any[]) => void,
) => Partial<InfiniteTableGroupColumnBase<T>>;
export type InfiniteTablePropPivotColumn<
  T,
  COL_TYPE = InfiniteTableColumn<T>,
> =
  | Partial<InfiniteTablePivotColumnBase<T>>
  | ((
      options: InfiniteTablePivotColumnGetterOptions<T, COL_TYPE>,
    ) => InfiniteTablePivotColumnBase<T>);

export type InfiniteTablePropPivotRowLabelsColumn<T> =
  InfiniteTablePropPivotColumn<T>;

export type InfiniteTablePropComponents = {
  LoadMask?: React.FC<LoadMaskProps>;
};

export type ScrollStopInfo = {
  scrollTop: number;
  firstVisibleRowIndex: number;
  lastVisibleRowIndex: number;
};
export interface InfiniteTableProps<T> {
  columns: InfiniteTablePropColumns<T>;
  pivotColumns?: InfiniteTablePropColumnsMap<T, InfiniteTablePivotColumn<T>>;

  loadingText?: Renderable;
  components?: InfiniteTablePropComponents;

  viewportReservedWidth?: number;

  pivotColumn?: InfiniteTablePropPivotColumn<
    T,
    InfiniteTableColumn<T> & InfiniteTablePivotFinalColumn<T>
  >;
  pivotRowLabelsColumn?: InfiniteTablePropPivotRowLabelsColumn<T>;
  pivotTotalColumnPosition?: InfiniteTablePropPivotTotalColumnPosition;

  groupColumn?: Partial<InfiniteTablePropGroupColumn<T>>;
  groupRenderStrategy?: InfiniteTablePropGroupRenderStrategy;
  hideEmptyGroupColumns?: boolean;

  columnVisibility?: InfiniteTablePropColumnVisibility;
  defaultColumnVisibility?: InfiniteTablePropColumnVisibility;

  pinnedStartMaxWidth?: number;
  pinnedEndMaxWidth?: number;

  columnPinning?: InfiniteTablePropColumnPinning;
  defaultColumnPinning?: InfiniteTablePropColumnPinning;

  columnSizing?: InfiniteTablePropColumnSizing;
  defaultColumnSizing?: InfiniteTablePropColumnSizing;

  pivotColumnGroups?: InfiniteTablePropColumnGroups;
  columnGroups?: InfiniteTablePropColumnGroups;
  defaultColumnGroups?: InfiniteTablePropColumnGroups;

  defaultCollapsedColumnGroups?: InfiniteTablePropCollapsedColumnGroups;
  collapsedColumnGroups?: InfiniteTablePropCollapsedColumnGroups;

  onScrollbarsChange?: (scrollbars: Scrollbars) => void;

  // TODO P1 clarify columnVisibility as object only
  onColumnVisibilityChange?: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;
  columnTypes?: InfiniteTablePropColumnTypes<T>;
  // columnVisibilityAssumeVisible?: boolean;

  showSeparatePivotColumnForSingleAggregation?: boolean;

  rowHeight: number | string;
  rowStyle?: InfiniteTablePropRowStyle<T>;
  rowClassName?: InfiniteTablePropRowClassName<T>;
  headerHeight: number | string;
  domProps?: React.HTMLProps<HTMLDivElement>;
  showZebraRows?: boolean;
  showHoverRows?: boolean;
  sortable?: boolean;
  draggableColumns?: boolean;
  header?: boolean;
  focusedClassName?: string;
  focusedWithinClassName?: string;
  focusedStyle?: React.CSSProperties;
  focusedWithinStyle?: React.CSSProperties;
  columnDefaultWidth?: number;
  columnMinWidth?: number;
  columnMaxWidth?: number;
  virtualizeColumns?: InfiniteTablePropVirtualizeColumns<T>;
  virtualizeRows?: boolean;

  defaultActiveIndex?: number;
  activeIndex?: number;

  onSelfFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onSelfBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onFocusWithin?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlurWithin?: (event: React.FocusEvent<HTMLDivElement>) => void;

  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
  scrollStopDelay?: number;
  onScrollStop?: (param: ScrollStopInfo) => void;
  scrollToBottomOffset?: number;

  defaultColumnOrder?: InfiniteTablePropColumnOrder;
  columnOrder?: InfiniteTablePropColumnOrder;
  onColumnOrderChange?: (columnOrder: InfiniteTablePropColumnOrder) => void;
  onRowHeightChange?: (rowHeight: number) => void;

  onReady?: (api: InfiniteTableImperativeApi<T>) => void;

  rowProps?:
    | React.HTMLProps<HTMLDivElement>
    | ((
        rowArgs: InfiniteTableRowStyleFnParams<T>,
      ) => React.HTMLProps<HTMLDivElement>);

  licenseKey?: string;

  scrollTopId?: string | number;
}

export type Scrollbars = {
  vertical: boolean;
  horizontal: boolean;
};
