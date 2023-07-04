import { createRef, KeyboardEvent, MouseEvent } from 'react';
import {
  DataSourceGroupBy,
  DataSourcePropGroupBy,
  DataSourceState,
} from '../../DataSource';
import { ReactHeadlessTableRenderer } from '../../HeadlessTable/ReactHeadlessTableRenderer';
import { ForwardPropsToStateFnResult } from '../../hooks/useComponentState';
import { CellPosition } from '../../types/CellPosition';
import { Renderable } from '../../types/Renderable';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';
import { ScrollListener } from '../../VirtualBrain/ScrollListener';

import { InfiniteTableColumnCellClassName } from '../components/InfiniteTableRow/InfiniteTableColumnCell';
import { ThemeVars } from '../theme.css';
import {
  InfiniteTableComputedColumn,
  InfiniteTableProps,
  InfiniteTableState,
} from '../types';
import {
  InfiniteTableColumnsMap,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
} from '../types/InfiniteTableProps';
import {
  InfiniteTableSetupState,
  InfiniteTableDerivedState,
  InfiniteTableMappedState,
  GroupByMap,
  CellContextMenuLocationWithEvent,
  ContextMenuLocationWithEvent,
} from '../types/InfiniteTableState';
import { toMap } from '../utils/toMap';

import { computeColumnGroupsDepths } from './computeColumnGroupsDepths';

function createRenderer(brain: MatrixBrain) {
  const renderer = new ReactHeadlessTableRenderer(brain);
  const onRenderUpdater = buildSubscriptionCallback<Renderable>();

  brain.onDestroy(() => {
    renderer.destroy();
    onRenderUpdater.destroy();
  });

  return {
    renderer,
    onRenderUpdater,
  };
}

export function getCellSelector(cellPosition?: CellPosition) {
  const selector = `.${InfiniteTableColumnCellClassName}[data-row-index${
    cellPosition ? `="${cellPosition.rowIndex}"` : ''
  }][data-col-index${cellPosition ? `="${cellPosition.colIndex}"` : ''}]`;

  return selector;
}
/**
 * The computed state is independent from props and cannot
 * be affected by props.
 */
export function initSetupState<T>(): InfiniteTableSetupState<T> {
  const columnsGeneratedForGrouping: InfiniteTableColumnsMap<T> = new Map();

  /**
   * This is the main virtualization brain that powers the table
   */
  const brain = new MatrixBrain();

  /**
   * The brain that virtualises the header is different from the main brain
   * because obviously the header will have different rowspans/colspans
   * (which are due to column groups) than the main grid viewport
   */
  const headerBrain = new MatrixBrain('header');

  // however, we sync the headerBrain with the main brain
  // on horizontal scrolling
  brain.onScroll((scrollPosition) => {
    headerBrain.setScrollPosition({
      scrollLeft: scrollPosition.scrollLeft,
      scrollTop: 0,
    });
  });

  if (__DEV__) {
    (globalThis as any).brain = brain;
    (globalThis as any).headerBrain = headerBrain;
  }

  const { renderer, onRenderUpdater } = createRenderer(brain);

  // and on width changes
  brain.onAvailableSizeChange((size) => {
    headerBrain.setAvailableSize({ width: size.width });
  });

  if (__DEV__) {
    (globalThis as any).renderer = renderer;
  }

  const domRef = createRef<HTMLDivElement>();

  return {
    renderer,
    onRenderUpdater,
    propsCache: new Map<keyof InfiniteTableProps<T>, WeakMap<any, any>>([]),

    cellContextMenuVisibleFor: null,
    contextMenuVisibleFor: null,
    columnMenuVisibleForColumnId: null,
    columnMenuVisibleKey: 0,
    filterOperatorMenuVisibleForColumnId: null,

    getDOMNodeForCell: (cellPosition: CellPosition) => {
      if (!domRef.current) {
        return null;
      }

      const selector = getCellSelector(cellPosition);

      return domRef.current.querySelector(selector) || null;
    },

    brain,
    headerBrain,

    domRef,
    columnMenuTargetRef: createRef(),
    editingValueRef: createRef(),
    scrollerDOMRef: createRef(),
    portalDOMRef: createRef(),
    focusDetectDOMRef: createRef(),
    activeCellIndicatorDOMRef: createRef(),

    onColumnMenuClick: buildSubscriptionCallback<{
      target: HTMLElement | EventTarget;
      column: InfiniteTableComputedColumn<T>;
    }>(),

    cellContextMenu:
      buildSubscriptionCallback<CellContextMenuLocationWithEvent>(),
    contextMenu: buildSubscriptionCallback<ContextMenuLocationWithEvent>(),

    onFilterOperatorMenuClick: buildSubscriptionCallback<{
      target: HTMLElement | EventTarget;
      column: InfiniteTableComputedColumn<T>;
    }>(),

    onRowHeightCSSVarChange: buildSubscriptionCallback<number>(),
    onColumnHeaderHeightCSSVarChange: buildSubscriptionCallback<number>(),
    cellClick: buildSubscriptionCallback<
      CellPosition & { event: MouseEvent }
    >(),
    cellMouseDown: buildSubscriptionCallback<
      CellPosition & { event: MouseEvent }
    >(),
    keyDown: buildSubscriptionCallback<KeyboardEvent>(),
    bodySize: {
      width: 0,
      height: 0,
    },
    scrollPosition: {
      scrollTop: 0,
      scrollLeft: 0,
    },
    columnReorderDragColumnId: false,
    ready: false,
    focused: false,
    focusedWithin: false,
    columnsWhenGrouping: columnsGeneratedForGrouping,
    columnVisibilityForGrouping: {},

    pinnedStartScrollListener: new ScrollListener(),
    pinnedEndScrollListener: new ScrollListener(),

    columnsWhenInlineGroupRenderStrategy: undefined,
    editingCell: null,
  };
}

export const forwardProps = <T>(
  setupState: InfiniteTableSetupState<T>,
): ForwardPropsToStateFnResult<
  InfiniteTableProps<T>,
  InfiniteTableMappedState<T>,
  InfiniteTableSetupState<T>
> => {
  return {
    scrollTopKey: 1,
    components: 1,
    id: 1,
    loadingText: 1,
    pivotColumns: 1,
    groupColumn: 1,
    onReady: 1,
    domProps: 1,
    onKeyDown: 1,
    onCellClick: 1,
    focusedClassName: 1,
    focusedWithinClassName: 1,
    focusedStyle: 1,
    focusedWithinStyle: 1,
    onSelfFocus: 1,
    onFocusWithin: 1,
    onSelfBlur: 1,
    onBlurWithin: 1,
    onContextMenu: 1,
    onCellContextMenu: 1,

    onScrollToTop: 1,
    onScrollToBottom: 1,
    onScrollStop: 1,
    scrollToBottomOffset: 1,

    getColumnMenuItems: 1,
    getCellContextMenuItems: 1,
    getContextMenuItems: 1,
    columnPinning: 1,
    editable: 1,
    columnDefaultEditable: 1,
    columnDefaultFilterable: 1,

    rowStyle: 1,
    rowProps: 1,
    rowClassName: 1,
    pinnedStartMaxWidth: 1,
    pinnedEndMaxWidth: 1,
    pivotColumn: 1,
    pivotColumnGroups: 1,
    getFilterOperatorMenuItems: 1,

    onScrollbarsChange: 1,
    autoSizeColumnsKey: 1,

    columnDefaultFlex: 1,

    scrollStopDelay: (scrollStopDelay) => scrollStopDelay ?? 250,

    viewportReservedWidth: (viewportReservedWidth) =>
      viewportReservedWidth ?? 0,
    resizableColumns: (resizableColumns) => resizableColumns ?? true,

    hideColumnWhenGrouped: (hideColumnWhenGrouped) =>
      hideColumnWhenGrouped ?? false,
    columnMinWidth: (columnMinWidth) => columnMinWidth ?? 30,
    columnMaxWidth: (columnMaxWidth) => columnMaxWidth ?? 5000,
    columnDefaultWidth: (columnDefaultWidth) => columnDefaultWidth ?? 200,

    columnCssEllipsis: (columnCssEllipsis) => columnCssEllipsis ?? true,
    draggableColumns: (draggableColumns) => draggableColumns ?? true,
    headerOptions: (headerOptions) => ({
      alwaysReserveSpaceForSortIcon: true,
      ...headerOptions,
    }),

    showSeparatePivotColumnForSingleAggregation: (
      showSeparatePivotColumnForSingleAggregation,
    ) => showSeparatePivotColumnForSingleAggregation ?? false,
    sortable: (sortable) => sortable ?? true,
    hideEmptyGroupColumns: (hideEmptyGroupColumns) =>
      hideEmptyGroupColumns ?? false,

    pivotTotalColumnPosition: (pivotTotalColumnPosition) =>
      pivotTotalColumnPosition ?? 'end',
    pivotGrandTotalColumnPosition: 1,

    // groupRenderStrategy: (groupRenderStrategy) =>
    //   groupRenderStrategy ?? 'multi-column',

    licenseKey: (licenseKey) => licenseKey || '',

    keyboardSelection: (keyboardSelection) => keyboardSelection ?? true,

    activeRowIndex: 1,
    activeCellIndex: 1,
    columnOrder: (columnOrder) => columnOrder ?? true,
    header: (header) => header ?? true,
    showZebraRows: (showZebraRows) => showZebraRows ?? true,
    showHoverRows: (showHoverRows) => showHoverRows ?? true,
    virtualizeColumns: (virtualizeColumns) => virtualizeColumns ?? true,

    rowHeight: (rowHeight) => (typeof rowHeight === 'number' ? rowHeight : 0),
    columnHeaderHeight: (columnHeaderHeight) =>
      typeof columnHeaderHeight === 'number' ? columnHeaderHeight : 30,

    columns: (columns) => toMap(columns, setupState.propsCache.get('columns')),
    columnVisibility: (columnVisibility) => columnVisibility ?? {},
    // TODO check if columnPinning works when the value for a pinned col is `true` instead of `"start"`

    columnSizing: (columnSizing) => columnSizing || {},
    columnTypes: (columnTypes) => columnTypes || {},

    onEditCancelled: 1,
    onEditRejected: 1,
    onEditAccepted: 1,

    persistEdit: 1,
    shouldAcceptEdit: 1,

    onEditPersistError: 1,
    onEditPersistSuccess: 1,

    multiSortBehavior: (multiSortBehavior) => multiSortBehavior ?? 'replace',

    collapsedColumnGroups: (collapsedColumnGroups) =>
      collapsedColumnGroups ?? new Map(),
    columnGroups: (columnGroups) =>
      toMap(columnGroups, setupState.propsCache.get('columnGroups')),
  };
};

type GetGroupColumnStrategyOptions<T> = {
  groupBy: DataSourceGroupBy<T>[];
  groupColumn?: Partial<InfiniteTablePropGroupColumn<T>>;
  groupRenderStrategy?: InfiniteTablePropGroupRenderStrategy;
};

function getGroupRenderStrategy<T>(
  options: GetGroupColumnStrategyOptions<T>,
): InfiniteTablePropGroupRenderStrategy {
  const { groupBy, groupColumn, groupRenderStrategy } = options;

  if (groupRenderStrategy) {
    return groupRenderStrategy;
  }

  if (groupColumn != null && typeof groupColumn === 'object') {
    return 'single-column';
  }

  const columnsInGroupBy = groupBy.filter((g) => g.column);

  if (columnsInGroupBy.length) {
    return 'multi-column';
  }

  return 'multi-column';
}

export const cleanupState = <T>(state: InfiniteTableState<T>) => {
  state.brain.destroy();
  state.headerBrain.destroy();
  state.renderer.destroy();
  state.onRenderUpdater.destroy();

  state.onRowHeightCSSVarChange.destroy();
  state.onColumnHeaderHeightCSSVarChange.destroy();
  state.onColumnMenuClick.destroy();
  state.onFilterOperatorMenuClick.destroy();

  state.domRef.current = null;
  state.columnMenuTargetRef.current = null;
  state.scrollerDOMRef.current = null;
  state.portalDOMRef.current = null;

  state.onRowHeightCSSVarChange.destroy();
  state.onColumnHeaderHeightCSSVarChange.destroy();
  state.pinnedEndScrollListener.destroy();
  state.pinnedStartScrollListener.destroy();
};

export function getGroupByMap<T>(groupBy: DataSourcePropGroupBy<T>) {
  return groupBy.reduce((acc, groupBy, index) => {
    const value = {
      groupBy,
      groupIndex: index,
    };

    if (groupBy.field) {
      acc.set(groupBy.field, value);
    } else if (groupBy.groupField) {
      acc.set(groupBy.groupField, value);
    }

    return acc;
  }, new Map() as GroupByMap<T>);
}

export const mapPropsToState = <T>(params: {
  props: InfiniteTableProps<T>;
  state: InfiniteTableState<T>;
  oldState: InfiniteTableState<T> | null;
  parentState: DataSourceState<T>;
}): InfiniteTableDerivedState<T> => {
  const { props, state, oldState, parentState } = params;

  const computedColumnGroups = state.pivotColumnGroups || state.columnGroups;

  const columnGroupsDepthsMap =
    (state.columnGroups && state.columnGroups != oldState?.columnGroups) ||
    (state.pivotColumnGroups &&
      state.pivotColumnGroups != oldState?.pivotColumnGroups)
      ? computeColumnGroupsDepths(computedColumnGroups)
      : state.columnGroupsDepthsMap;

  const groupBy = parentState?.groupBy;
  const groupRenderStrategy = getGroupRenderStrategy({
    groupRenderStrategy: props.groupRenderStrategy,
    groupBy,
    groupColumn: props.groupColumn,
  });

  const computedColumns =
    state.columnsWhenGrouping ||
    state.columnsWhenInlineGroupRenderStrategy ||
    state.columns;

  return {
    showColumnFilters: props.showColumnFilters ?? !!parentState.filterValue,
    controlledColumnVisibility: !!props.columnVisibility,
    groupRenderStrategy,
    groupBy: groupBy,
    computedColumns,
    initialColumns: props.columns,

    keyboardNavigation:
      props.keyboardNavigation ??
      (state.activeCellIndex != null
        ? 'cell'
        : state.activeRowIndex != null
        ? 'row'
        : 'cell'),

    columnHeaderCssEllipsis:
      props.columnHeaderCssEllipsis ?? props.columnCssEllipsis ?? true,
    columnGroupsDepthsMap,
    columnGroupsMaxDepth:
      columnGroupsDepthsMap != state.columnGroupsDepthsMap
        ? Math.max(...columnGroupsDepthsMap.values(), 0)
        : state.columnGroupsMaxDepth,
    computedColumnGroups,

    rowHeightCSSVar: typeof props.rowHeight === 'string' ? props.rowHeight : '',
    columnHeaderHeightCSSVar:
      typeof props.columnHeaderHeight === 'string'
        ? props.columnHeaderHeight ||
          ThemeVars.components.Header.columnHeaderHeight
        : '',
  };
};
