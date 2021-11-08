import type { ScrollPosition } from '../../types/ScrollPosition';
import type {
  InfiniteTableColumnGroup,
  InfiniteTableGeneratedColumns,
  InfiniteTablePropCollapsedColumnGroups,
  InfiniteTablePropColumnAggregations,
  InfiniteTablePropColumnGroups,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumnVisibility,
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTableProps,
} from './InfiniteTableProps';

import { Size } from '../../types/Size';
import { ComponentStateActions } from '../../hooks/useComponentState';
import { MutableRefObject } from 'react';
import { SubscriptionCallback } from '../../types/SubscriptionCallback';
import { ScrollListener } from '../../VirtualBrain/ScrollListener';

export interface InfiniteTableSetupState {
  domRef: MutableRefObject<HTMLDivElement | null>;
  bodyDOMRef: MutableRefObject<HTMLDivElement | null>;
  portalDOMRef: MutableRefObject<HTMLDivElement | null>;
  onRowHeightCSSVarChange: SubscriptionCallback<number>;
  onHeaderHeightCSSVarChange: SubscriptionCallback<number>;
}
export interface InfiniteTableDynamicState<T> {
  hideEmptyGroupColumns: boolean;

  columnShifts: null | number[];
  draggingColumnId: null | string;
  // viewportSize: Size;
  bodySize: Size;
  scrollPosition: ScrollPosition;
  columnOrder: InfiniteTablePropColumnOrder;
  columnVisibility: InfiniteTablePropColumnVisibility;
  columnPinning: InfiniteTablePropColumnPinning;
  columnAggregations: InfiniteTablePropColumnAggregations<T>;
  columnGroups: InfiniteTablePropColumnGroups;
  collapsedColumnGroups: InfiniteTablePropCollapsedColumnGroups;
  columnGroupsDepthsMap: InfiniteTableColumnGroupsDepthsMap;
  columnGroupsMaxDepth: number;
  computedColumns: InfiniteTableProps<T>['columns'];
  columns: InfiniteTableProps<T>['columns'];
  pivotColumns: InfiniteTableProps<T>['pivotColumns'];
  computedPivotColumns: InfiniteTableProps<T>['pivotColumns'];
  pivotColumnGroups?: InfiniteTablePropColumnGroups;
  computedColumnGroups: InfiniteTablePropColumnGroups;
  generatedColumns: InfiniteTableGeneratedColumns<T>;
  pinnedStartScrollListener: ScrollListener;
  pinnedEndScrollListener: ScrollListener;
  rowHeightComputed: number;
  headerHeightComputed: number;
}

export type InfiniteTableComputedColumnGroup = InfiniteTableColumnGroup & {
  depth: number;
};
export type InfiniteTableColumnGroupsDepthsMap = Map<string, number>;

export interface InfiniteTableComponentState<T>
  extends InfiniteTableDynamicState<T>,
    InfiniteTableDerivedState<T>,
    InfiniteTableSetupState {}

export type InfiniteTablePropPivotTotalColumnPosition = false | 'start' | 'end';
export interface InfiniteTableDerivedState<T> {
  // rowHeightComputed: number;
  // headerHeightComputed: number;
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  pivotTotalColumnPosition: InfiniteTablePropPivotTotalColumnPosition;
  onReady: InfiniteTableProps<T>['onReady'];
  // columns: InfiniteTableProps<T>['columns'];
  rowProps: InfiniteTableProps<T>['rowProps'];
  rowStyle: InfiniteTableProps<T>['rowStyle'];
  rowClassName: InfiniteTableProps<T>['rowClassName'];
  groupColumn: InfiniteTableProps<T>['groupColumn'];
  pivotColumn: InfiniteTableProps<T>['pivotColumn'];
  pivotRowLabelsColumn: InfiniteTableProps<T>['pivotRowLabelsColumn'];

  pinnedStartMaxWidth: InfiniteTableProps<T>['pinnedStartMaxWidth'];
  pinnedEndMaxWidth: InfiniteTableProps<T>['pinnedEndMaxWidth'];
  showZebraRows: InfiniteTableProps<T>['showZebraRows'];
  showHoverRows: InfiniteTableProps<T>['showHoverRows'];
  header: InfiniteTableProps<T>['header'];

  columnMinWidth: InfiniteTableProps<T>['columnMinWidth'];
  columnMaxWidth: InfiniteTableProps<T>['columnMaxWidth'];
  columnDefaultWidth: InfiniteTableProps<T>['columnDefaultWidth'];
  sortable: InfiniteTableProps<T>['sortable'];
  virtualizeColumns: InfiniteTableProps<T>['virtualizeColumns'];
  virtualizeHeader: boolean;
  licenseKey: string;
  domProps: InfiniteTableProps<T>['domProps'];
  draggableColumns: boolean;
  columnGroupsDepthsMap: InfiniteTableColumnGroupsDepthsMap;
  columnGroupsMaxDepth: number;
  computedColumnGroups: InfiniteTablePropColumnGroups;

  rowHeightCSSVar: string;
  headerHeightCSSVar: string;
}

export type InfiniteTableComponentActions<T> = ComponentStateActions<
  InfiniteTableDynamicState<T>
>;
