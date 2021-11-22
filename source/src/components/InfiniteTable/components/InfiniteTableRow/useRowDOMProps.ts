import {
  CSSProperties,
  MutableRefObject,
  RefCallback,
  useCallback,
  useRef,
} from 'react';

import { join } from '../../../../utils/join';
import {
  InfiniteTableRowClassName,
  InfiniteTableElement__hover,
} from './InfiniteTableRowClassName';

import type { InfiniteTableRowProps } from './InfiniteTableRowTypes';
import { InfiniteTableState } from '../../types/InfiniteTableState';
import { InfiniteTableRowStyleFnParams } from '../../types/InfiniteTableProps';
import { position, left, top } from '../../utilities.css';
import { RowCls, RowClsVariants } from './row.css';

export type TableRowHTMLAttributes = React.HTMLAttributes<HTMLDivElement> & {
  'data-virtualize-columns': 'on' | 'off';
  'data-hover-index': number;
  'data-row-index': number;
  'data-row-id': string;
  ref: RefCallback<HTMLElement | null>;
} & any;

export function useRowDOMProps<T>(
  props: InfiniteTableRowProps<T>,
  rowProps: InfiniteTableState<T>['rowProps'],
  rowStyle: InfiniteTableState<T>['rowStyle'],
  rowClassName: InfiniteTableState<T>['rowClassName'],
  groupRenderStrategy: InfiniteTableState<T>['groupRenderStrategy'],
  tableDOMRef: MutableRefObject<HTMLDivElement | null>,
): {
  domProps: TableRowHTMLAttributes;
  domRef: MutableRefObject<HTMLElement | null>;
} {
  const domProps = props.domProps;
  const {
    showZebraRows = false,
    showHoverRows = false,
    rowIndex,
    domRef: domRefFromProps,
    rowInfo,
  } = props;

  const domRef = useRef<HTMLElement | null>(null);
  const rowDOMRef = useCallback((node) => {
    domRefFromProps(node);
    domRef.current = node;
  }, []);

  const rowPropsAndStyleArgs: InfiniteTableRowStyleFnParams<T> = {
    data: rowInfo.data,
    rowInfo,
    rowIndex,
    groupRowsBy: rowInfo.groupBy,
  };

  if (typeof rowProps === 'function') {
    rowProps = rowProps(rowPropsAndStyleArgs);
  }

  let style: CSSProperties | undefined = rowProps ? rowProps.style : undefined;

  const inlineGroupRoot =
    groupRenderStrategy === 'inline' && rowInfo.indexInGroup === 0;

  if (rowStyle) {
    style =
      typeof rowStyle === 'function'
        ? { ...style, ...rowStyle(rowPropsAndStyleArgs) }
        : { ...style, ...rowStyle };
  }

  if (inlineGroupRoot) {
    style = style || {};
    //TODO remove this harcoded value - should be datasource size - ...
    style.zIndex = 2_000_000 - rowInfo.indexInAll;
  }

  const odd =
    (rowInfo.indexInAll != null ? rowInfo.indexInAll : rowIndex) % 2 === 1;

  let rowComputedClassName =
    typeof rowClassName === 'function'
      ? rowClassName(rowPropsAndStyleArgs)
      : rowClassName;

  const className = join(
    position.absolute,
    top[0],
    left[0],
    InfiniteTableRowClassName,
    RowCls,
    `${InfiniteTableRowClassName}--${
      rowInfo.isGroupRow ? 'group' : 'normal'
    }-row`,
    rowInfo.isGroupRow ? RowClsVariants.groupRow : RowClsVariants.normal,
    inlineGroupRoot
      ? `${InfiniteTableRowClassName}--inline-group-row ${RowClsVariants.inlineGroupRow}`
      : '',
    showZebraRows
      ? `${InfiniteTableRowClassName}--${odd ? 'odd' : 'even'} ${
          odd ? RowClsVariants.odd : RowClsVariants.even
        }`
      : null,
    showHoverRows ? `${InfiniteTableRowClassName}--show-hover` : null,
    domProps?.className,
    rowProps?.className,
    rowComputedClassName,
  );

  const initialMouseEnter = rowProps?.onMouseEnter;
  const initialMouseLeave = rowProps?.onMouseLeave;

  // const parentIndex = brain.getItemSpanParent(rowIndex);
  // const covered = parentIndex !== rowIndex;

  const onMouseEnter = useCallback(
    (event) => {
      initialMouseEnter?.(event);

      const rowIndex = event.currentTarget?.dataset.rowIndex * 1;

      const parentNode = tableDOMRef.current;

      if (!parentNode || !showHoverRows) {
        return;
      }

      const hoverSelector = [
        `.${InfiniteTableRowClassName}[data-hover-index="${rowIndex}"]`,
      ];

      const rows = parentNode.querySelectorAll(hoverSelector.join(','));
      rows.forEach((row) => row.classList.add(InfiniteTableElement__hover));
    },
    [initialMouseEnter, showHoverRows],
  );

  const onMouseLeave = useCallback(
    (event) => {
      initialMouseLeave?.(event);

      const rowIndex = event.currentTarget?.dataset.rowIndex;

      const parentNode = tableDOMRef.current;

      if (!parentNode || !showHoverRows) {
        return;
      }

      const hoverSelector = [
        `.${InfiniteTableRowClassName}[data-hover-index="${rowIndex}"]`,
      ];
      const rows = parentNode.querySelectorAll(hoverSelector.join(','));
      rows.forEach((row) => row.classList.remove(InfiniteTableElement__hover));
    },
    [initialMouseLeave, showHoverRows],
  );

  return {
    domRef,
    domProps: {
      ...rowProps,
      ...domProps,
      style,
      'data-virtualize-columns': props.virtualizeColumns ? 'on' : 'off',
      'data-row-index': rowIndex,

      // 'data-hover-index': covered ? null : rowIndex,
      'data-hover-index': rowIndex,
      'data-row-id': `${rowInfo.id}`,
      className,
      onMouseEnter,
      onMouseLeave,
      ref: rowDOMRef,
    },
  };
}
