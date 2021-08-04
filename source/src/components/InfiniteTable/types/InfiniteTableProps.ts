import * as React from 'react';
import { GroupByReducer } from '../../../utils/groupAndPivot';
import type {
  InfiniteTableColumn,
  InfiniteTableComputedColumn,
} from './InfiniteTableColumn';

// export type TablePropColumnOrderItem = string | { id: string; visible: boolean };
export type InfiniteTablePropColumnOrderNormalized = string[];
export type InfiniteTablePropColumnOrder =
  | InfiniteTablePropColumnOrderNormalized
  | true;

export type InfiniteTablePropColumnVisibility = Map<string, false>;
export type InfiniteTablePropColumnPinning = Map<
  string,
  true | 'start' | 'end'
>;

export type InfiniteTableColumnAggregator<T, AggregationResultType> =
  GroupByReducer<T, AggregationResultType>;

export type InfiniteTablePropColumnAggregations<T> = Map<
  string,
  GroupByReducer<T, any>
>;

export type InfiniteTableImperativeApi<T> = {
  setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => void;
  setColumnVisibility: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;
  x?: T;
};
export type InfiniteTablePropVirtualizeColumns<T> =
  | boolean
  | ((columns: InfiniteTableComputedColumn<T>[]) => boolean);

export type InfiniteTableInternalProps<T> = {
  rowHeight: number;
  ___t?: T;
};
export type InfiniteTableProps<T> = {
  columns: Map<string, InfiniteTableColumn<T>>;

  columnVisibility?: InfiniteTablePropColumnVisibility;
  defaultColumnVisibility?: InfiniteTablePropColumnVisibility;
  columnPinning?: InfiniteTablePropColumnPinning;
  defaultColumnPinning?: InfiniteTablePropColumnPinning;

  columnAggregations?: InfiniteTablePropColumnAggregations<T>;

  onColumnVisibilityChange?: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;
  // columnVisibilityAssumeVisible?: boolean;

  primaryKey: string;
  rowHeight: number | string;
  domProps?: React.HTMLProps<HTMLDivElement>;
  showZebraRows?: boolean;
  sortable?: boolean;
  draggableColumns?: boolean;
  header?: boolean;
  columnDefaultWidth?: number;
  columnMinWidth?: number;
  columnMaxWidth?: number;
  virtualizeColumns?: InfiniteTablePropVirtualizeColumns<T>;
  virtualizeRows?: boolean;

  defaultColumnOrder?: InfiniteTablePropColumnOrder;
  columnOrder?: InfiniteTablePropColumnOrder;
  onColumnOrderChange?: (columnOrder: InfiniteTablePropColumnOrder) => void;

  onReady?: (api: InfiniteTableImperativeApi<T>) => void;

  rowProps?:
    | React.HTMLProps<HTMLDivElement>
    | ((rowArgs: {
        rowIndex: number;
        data: T | null;
      }) => React.HTMLProps<HTMLDivElement>);

  licenseKey?: string;
};

export type InfiniteTableOwnProps<T> = InfiniteTableProps<T> & {
  rowHeight: number;
  rowHeightCSSVar: string;
  onHeaderResize: (height: number) => void;
  bodyDOMRef?: React.RefObject<HTMLDivElement | null>;
};
