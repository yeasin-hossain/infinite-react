import { CSSProperties, FocusEvent } from 'react';
import { InfiniteTableClassName } from '..';
import { join } from '../../../utils/join';
import { stripVar } from '../../../utils/stripVar';
import {
  InfiniteCls,
  InfiniteClsRecipe,
  InfiniteClsShiftingColumns,
} from '../InfiniteCls.css';
import { InternalVars } from '../theme.css';
import { rafFn } from '../utils/rafFn';
import { useInfiniteTable } from './useInfiniteTable';

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnOffsetAtIndex = stripVar(InternalVars.columnOffsetAtIndex);
export function useDOMProps<T>(
  initialDOMProps?: React.HTMLProps<HTMLDivElement>,
) {
  const { computed, componentState, componentActions } = useInfiniteTable<T>();
  const {
    columnShifts,
    focused,
    focusedWithin,
    domRef,
    onBlurWithin,
    onFocusWithin,
    onSelfFocus,
    onSelfBlur,
  } = componentState;
  const {
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    computedVisibleColumns,
  } = computed;

  const cssVars: CSSProperties = computedVisibleColumns.reduce(
    (vars: CSSProperties, col) => {
      const index = col.computedVisibleIndex;
      //@ts-ignore
      vars[`${columnWidthAtIndex}-${index}`] = col.computedWidth + 'px';
      //@ts-ignore
      vars[`${columnOffsetAtIndex}-${index}`] = col.computedOffset + 'px';
      return vars;
    },
    {},
  );

  const setFocused = rafFn((focused: boolean) => {
    componentActions.focused = focused;
  });
  const setFocusedWithin = rafFn((focused: boolean) => {
    componentActions.focusedWithin = focused;
  });

  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    initialDOMProps?.onFocus?.(event);

    if (event.target === domRef.current) {
      setFocused(true);
      onSelfFocus?.(event);

      if (focusedWithin) {
        setFocusedWithin(false);
        onBlurWithin?.(event);
      }
    } else {
      if (!focusedWithin) {
        setFocusedWithin(true);
        onFocusWithin?.(event);
      }
    }
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    initialDOMProps?.onBlur?.(event);

    if (event.target === domRef.current) {
      setFocused(false);
      onSelfBlur?.(event);

      if (focusedWithin) {
        setFocusedWithin(false);
        onBlurWithin?.(event);
      }
    } else {
      const contained = domRef.current?.contains((event as any).relatedTarget);

      if (!contained) {
        setFocusedWithin(false);
        onBlurWithin?.(event);
      }
    }
  };

  const domProps = {
    tabIndex: 0,
    ...initialDOMProps,
    onFocus,
    onBlur,
  };

  const className = join(
    InfiniteTableClassName,
    InfiniteCls,
    columnShifts
      ? `${InfiniteClsShiftingColumns} ${InfiniteTableClassName}--shifting`
      : '',

    domProps?.className,
    computedPinnedStartColumnsWidth
      ? `${InfiniteTableClassName}--has-pinned-start`
      : null,
    computedPinnedEndColumnsWidth
      ? `${InfiniteTableClassName}--has-pinned-end`
      : null,
    focused ? `${InfiniteTableClassName}--focused` : null,
    focusedWithin ? `${InfiniteTableClassName}--focused-within` : null,

    focused && componentState.focusedClassName
      ? componentState.focusedClassName
      : null,
    focusedWithin && componentState.focusedWithinClassName
      ? componentState.focusedWithinClassName
      : null,
    computed.computedPinnedStartOverflow
      ? `${InfiniteTableClassName}--has-pinned-start-overflow`
      : null,
    computed.computedPinnedEndOverflow
      ? `${InfiniteTableClassName}--has-pinned-end-overflow`
      : null,

    InfiniteClsRecipe({
      hasPinnedStart: !!computedPinnedStartColumnsWidth,
      hasPinnedEnd: !!computedPinnedEndColumnsWidth,
      // hasPinnedStartOverflow: !!computed.computedPinnedStartOverflow,
      // hasPinnedEndOverflow: !!computed.computedPinnedEndOverflow,
      focused,
      focusedWithin,
    }),
  );

  domProps.className = className;

  domProps.style = {
    ...initialDOMProps?.style,
    ...cssVars,
  };
  if (focused) {
    if (componentState.focusedStyle) {
      Object.assign(domProps.style, componentState.focusedStyle);
    }
  }
  if (focusedWithin) {
    if (componentState.focusedWithinStyle) {
      Object.assign(domProps.style, componentState.focusedWithinStyle);
    }
  }

  return domProps;
}
