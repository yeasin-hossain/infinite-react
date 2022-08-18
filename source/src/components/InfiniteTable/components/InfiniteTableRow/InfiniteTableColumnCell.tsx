import * as React from 'react';
import { useCallback, useContext, useMemo } from 'react';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { useDataSourceContextValue } from '../../../DataSource/publicHooks/useDataSource';

import { useCellClassName } from '../../hooks/useCellClassName';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { internalProps } from '../../internalProps';
import { InternalVars } from '../../theme.css';

import type {
  InfiniteTableColumnRenderParam,
  InfiniteTableColumnCellContextType,
  InfiniteTableColumnRenderFunction,
  InfiniteTableColumnClassName,
  InfiniteTableColumnStyleFnParams,
  InfiniteTableColumnStyle,
} from '../../types/InfiniteTableColumn';
import { InfiniteTableRowStyleFnParams } from '../../types/InfiniteTableProps';
import { styleForGroupColumn } from '../../utils/getColumnForGroupBy';
import { objectValuesExcept } from '../../utils/objectValuesExcept';
import { RenderCellHookComponent } from '../../utils/RenderHookComponent';
import { ColumnCellRecipe, SelectionCheckboxCls } from '../cell.css';
import { InfiniteCheckBox } from '../CheckBox';
import {
  getColumnRenderingParams,
  InfiniteTableColumnRenderingContext,
} from './columnRendering';

import {
  InfiniteTableCell,
  InfiniteTableCellClassName,
} from './InfiniteTableCell';
import {
  InfiniteTableCellProps,
  InfiniteTableColumnCellProps,
} from './InfiniteTableCellTypes';

const { rootClassName } = internalProps;

const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

export const InfiniteTableColumnCellContext = React.createContext<
  InfiniteTableColumnCellContextType<any>
>(null as any as InfiniteTableColumnCellContextType<any>);

export const InfiniteTableColumnCellClassName = `${rootClassName}ColumnCell`;

export const defaultRenderSelectionCheckBox: InfiniteTableColumnRenderFunction<
  any
> = (params) => {
  const {
    rowInfo,
    selectCurrentRow,
    deselectCurrentRow,
    toggleCurrentGroupRowSelection,
    column,
  } = params;

  if (rowInfo.isGroupRow && !column.groupByField) {
    return null;
  }

  return (
    <InfiniteCheckBox
      domProps={{
        className: SelectionCheckboxCls,
      }}
      onChange={(selected) => {
        if (rowInfo.isGroupRow) {
          toggleCurrentGroupRowSelection();
          return;
        }

        if (selected) {
          selectCurrentRow();
        } else {
          deselectCurrentRow();
        }
      }}
      checked={rowInfo.rowSelected}
    />
  );
};

function applyColumnClassName<T>(
  columnClassName: InfiniteTableColumnClassName<T>,
  param: InfiniteTableColumnStyleFnParams<T>,
) {
  const colClassName: undefined | string = columnClassName
    ? typeof columnClassName === 'function'
      ? columnClassName(param)
      : columnClassName
    : undefined;

  return colClassName;
}

function applyColumnStyle<T>(
  existingStyle: React.CSSProperties | undefined,
  columnStyle: InfiniteTableColumnStyle<T>,
  param: InfiniteTableColumnStyleFnParams<T>,
) {
  return typeof columnStyle === 'function'
    ? { ...existingStyle, ...columnStyle(param) }
    : { ...existingStyle, ...columnStyle };
}

function InfiniteTableColumnCellFn<T>(props: InfiniteTableColumnCellProps<T>) {
  const {
    rowInfo,
    rowStyle,
    rowClassName,

    // getData,
    width,
    column,
    onMouseLeave,
    onMouseEnter,

    // toggleGroupRow,
    rowIndex,
    rowHeight,
    columnsMap,

    fieldsToColumn,

    domRef,
    hidden,
    showZebraRows,
  } = props;

  if (!column) {
    return <div ref={domRef}>no column</div>;
  }

  const { rowSelected } = rowInfo;

  const { getState, componentActions, imperativeApi } = useInfiniteTable<T>();
  const { componentState: dataSourceState, getState: getDataSourceState } =
    useDataSourceContextValue<T>();

  const { activeRowIndex, keyboardNavigation } = getState();
  const rowActive = rowIndex === activeRowIndex && keyboardNavigation === 'row';

  const renderingContext: InfiniteTableColumnRenderingContext<T> = {
    getState,
    getDataSourceState,
    actions: componentActions,
    api: imperativeApi,
  };

  const {
    stylingParam,
    renderParams,
    formattedValueContext,
    renderFunctions,
    groupByColumn,
  } = getColumnRenderingParams({
    column,
    rowInfo,
    columnsMap,
    fieldsToColumn,
    context: renderingContext,
  });

  const renderParam = renderParams as InfiniteTableColumnRenderParam<T>;

  const onClick = useCallback(
    (event) => {
      const colIndex = column.computedVisibleIndex;

      getState().cellClick({
        rowIndex,
        colIndex,
        event,
      });
    },
    [rowIndex, column.computedVisibleIndex, keyboardNavigation],
  );

  const onMouseDown = useCallback(
    (event) => {
      const colIndex = column.computedVisibleIndex;

      getState().cellMouseDown({
        rowIndex,
        colIndex,
        event,
      });

      if (keyboardNavigation === 'row') {
        componentActions.activeRowIndex = rowIndex;
        return;
      }
      if (keyboardNavigation === 'cell') {
        componentActions.activeCellIndex = [rowIndex, colIndex];
      }
    },
    [rowIndex, column.computedVisibleIndex, keyboardNavigation],
  );

  const { selectionMode } = dataSourceState;

  renderParam.domRef = domRef;

  renderParam.selectCurrentRow = useCallback(renderParam.selectCurrentRow, [
    rowInfo,
  ]);
  renderParam.deselectCurrentRow = useCallback(renderParam.deselectCurrentRow, [
    rowInfo,
  ]);
  renderParam.toggleCurrentGroupRow = useCallback(
    renderParam.toggleCurrentGroupRow,
    [rowInfo],
  );
  renderParam.toggleCurrentGroupRowSelection = useCallback(
    renderParam.toggleCurrentGroupRowSelection,
    [rowInfo],
  );

  const renderChildren = useCallback(() => {
    if (hidden) {
      return null;
    }

    if (renderFunctions.renderGroupIcon) {
      renderParam.renderBag.groupIcon = (
        <RenderCellHookComponent
          render={renderFunctions.renderGroupIcon}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }
    if (
      renderFunctions.renderSelectionCheckBox &&
      selectionMode == 'multi-row'
    ) {
      // make selectionCheckBox available in the render bag
      // when we have column.renderSelectionCheckBox defined as a function
      // as people might want to use the default value
      // and enhance it
      renderParam.renderBag.selectionCheckBox = (
        <RenderCellHookComponent
          render={defaultRenderSelectionCheckBox}
          renderParam={renderParam}
        />
      );

      if (renderFunctions.renderSelectionCheckBox !== true) {
        renderParam.renderBag.selectionCheckBox = (
          <RenderCellHookComponent
            render={renderFunctions.renderSelectionCheckBox}
            renderParam={{
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            }}
          />
        );
      }
    }

    if (renderFunctions.renderValue) {
      renderParam.renderBag.value = (
        <RenderCellHookComponent
          render={renderFunctions.renderValue}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }

    if (rowInfo.isGroupRow && renderFunctions.renderGroupValue) {
      renderParam.renderBag.value = (
        <RenderCellHookComponent
          render={renderFunctions.renderGroupValue}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }
    if (!rowInfo.isGroupRow && renderFunctions.renderLeafValue) {
      renderParam.renderBag.value = (
        <RenderCellHookComponent
          render={renderFunctions.renderLeafValue}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }

    if (column.render) {
      return (
        <RenderCellHookComponent
          render={column.render}
          renderParam={renderParam}
        />
      );
    }

    return (
      <>
        {column.align !== 'end' ? renderParam.renderBag.groupIcon : null}
        {column.align !== 'end'
          ? renderParam.renderBag.selectionCheckBox
          : null}
        {renderParam.renderBag.value}

        {column.align === 'end'
          ? renderParam.renderBag.selectionCheckBox
          : null}
        {column.align === 'end' ? renderParam.renderBag.groupIcon : null}
      </>
    );
  }, [
    column,
    hidden,
    ...objectValuesExcept(renderParam, {
      renderBag: true,
    }),
  ]);

  const rowPropsAndStyleArgs: InfiniteTableRowStyleFnParams<T> = {
    ...formattedValueContext,
    rowIndex,
  };

  const rowComputedClassName =
    typeof rowClassName === 'function'
      ? rowClassName(rowPropsAndStyleArgs)
      : rowClassName;

  let colClassName: string | undefined = undefined;

  if (groupByColumn?.className) {
    colClassName = applyColumnClassName(groupByColumn.className, stylingParam);
  }
  if (column.className) {
    colClassName = join(
      colClassName,
      applyColumnClassName(column.className, stylingParam),
    );
  }

  let style: React.CSSProperties | undefined;

  if (rowInfo.dataSourceHasGrouping && column.groupByField) {
    style = styleForGroupColumn({ rowInfo });
  }

  if (rowStyle) {
    style =
      typeof rowStyle === 'function'
        ? { ...style, ...rowStyle(rowPropsAndStyleArgs) }
        : { ...style, ...rowStyle };
  }

  if (groupByColumn?.style) {
    style = applyColumnStyle(style, groupByColumn.style, stylingParam);
  }
  if (column.style) {
    style = applyColumnStyle(style, column.style, stylingParam);
  }
  style = style || {};

  style.height = rowHeight;
  style.zIndex = `var(${columnZIndexAtIndex}-${column.computedVisibleIndex})`;

  const memoizedStyle = useMemo(
    () => style,
    [!style ? null : JSON.stringify(style)],
  );

  const odd =
    (rowInfo.indexInAll != null ? rowInfo.indexInAll : rowIndex) % 2 === 1;

  const zebra = showZebraRows ? (odd ? 'odd' : 'even') : false;

  const cellProps: InfiniteTableCellProps<T> &
    React.HTMLAttributes<HTMLElement> = {
    domRef,
    cellType: 'body',
    column,
    width,
    rowId: rowInfo.id,

    style: memoizedStyle,
    onMouseLeave,
    onMouseEnter,
    onClick,
    onMouseDown,
    cssEllipsis: column.cssEllipsis ?? true,
    className: join(
      useCellClassName(
        column,
        [InfiniteTableColumnCellClassName, InfiniteTableCellClassName],
        ColumnCellRecipe,
        { dragging: false, zebra, rowActive, rowSelected },
      ),
      colClassName,
      rowComputedClassName,
    ),
    renderChildren,
  };

  // const ContextProvider =
  //   InfiniteTableColumnCellContext.Provider as React.Provider<
  //     InfiniteTableColumnCellContextType<T>
  //   >;

  return <InfiniteTableCell<T> {...cellProps}></InfiniteTableCell>;
}

export const InfiniteTableColumnCell = React.memo(
  InfiniteTableColumnCellFn,
) as typeof InfiniteTableColumnCellFn;

export function useInfiniteColumnCell<T>() {
  const result = useContext(
    InfiniteTableColumnCellContext,
  ) as InfiniteTableColumnCellContextType<T>;

  return result;
}
