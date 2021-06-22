import * as React from 'react';

import {
  useReducer,
  useMemo,
  Ref,
  RefObject,
  useRef,
  useCallback,
} from 'react';

import type {
  InfiniteTableFactoryConfig,
  InfiniteTableContextValue,
  InfiniteTableProps,
  InfiniteTableState,
  InfiniteTableAction,
  InfiniteTableInternalProps,
} from './types';

import { join } from '../../utils/join';

import { internalProps } from './internalProps';
import { getDefaultProps } from './getDefaultProps';

import { getInfiniteTableContext } from './InfiniteTableContext';

import { reducer } from './state/reducer';
import { getInitialState } from './state/initialState';
import { getReducerActions } from './state/getReducerActions';

import { useResizeObserver } from '../ResizeObserver';
import { useInfiniteTable } from './hooks/useInfiniteTable';
import { useComputed } from './hooks/useComputed';
import { useLatest } from '../hooks/useLatest';

import { useDataSourceContextValue } from '../DataSource/publicHooks/useDataSource';

import { InfiniteTableBody } from './components/InfiniteTableBody';

import { TableHeaderWrapper } from './components/InfiniteTableHeader/InfiniteTableHeaderWrapper';
import { VirtualScrollContainer } from '../VirtualScrollContainer';
import { SpacePlaceholder } from '../VirtualList/SpacePlaceholder';

import { useListRendering } from './hooks/useListRendering';
import { Size } from '../types/Size';
import { ICSS } from '../../style/utilities';

export const InfiniteTableClassName = internalProps.rootClassName;

const ONLY_VERTICAL_SCROLLBAR = {
  horizontal: false,
  vertical: true,
};

const InfiniteTableFactory = <T extends unknown>(
  _cfg: InfiniteTableFactoryConfig = {},
) => {
  const Table = React.forwardRef(
    (
      props: InfiniteTableProps<T> & InfiniteTableInternalProps<T>,
      domRef: Ref<HTMLDivElement>,
    ) => {
      const { domProps, header, onHeaderResize } = props;

      const {
        computed: { dataArray },
      } = useDataSourceContextValue<T>();

      const { computed, actions, state, bodyDOMRef, portalDOMRef } =
        useInfiniteTable<T>();

      const getProps = useLatest(props);
      const getActions = useLatest(actions);

      const { columnShifts, bodySize } = state;

      const className = join(
        InfiniteTableClassName,
        columnShifts ? `${InfiniteTableClassName}--shifting` : '',
        domProps?.className,
      );

      const {
        pinnedStartList,
        pinnedEndList,
        centerList,

        pinnedEndScrollbarPlaceholder,
        pinnedStartScrollbarPlaceholder,

        repaintId,
        scrollbars,
        applyScrollVertical,
        horizontalVirtualBrain,

        reservedContentHeight,
      } = useListRendering({
        domRef,
        columnShifts,
        bodySize,
        computed,
        getActions,
        getProps,
      });

      return (
        <div ref={domRef} {...domProps} className={className}>
          {header ? (
            <TableHeaderWrapper
              brain={horizontalVirtualBrain}
              repaintId={repaintId}
              scrollbars={scrollbars}
              onResize={onHeaderResize}
            />
          ) : null}

          <InfiniteTableBody>
            <VirtualScrollContainer
              ref={bodyDOMRef as RefObject<HTMLDivElement>}
              onContainerScroll={applyScrollVertical}
              scrollable={ONLY_VERTICAL_SCROLLBAR}
            >
              <div className={ICSS.display.flex}>
                {pinnedStartList}
                {centerList}
                {pinnedEndList}
              </div>

              <SpacePlaceholder
                count={dataArray.length}
                width={0}
                height={reservedContentHeight}
              />
            </VirtualScrollContainer>

            {pinnedStartScrollbarPlaceholder}
            {pinnedEndScrollbarPlaceholder}
          </InfiniteTableBody>

          <div
            ref={portalDOMRef as RefObject<HTMLDivElement>}
            className="ITable-Portal"
          />
        </div>
      );
    },
  );

  const InfiniteTableContextProvider = (props: InfiniteTableProps<T>) => {
    const [state, dispatch] = useReducer<
      React.Reducer<InfiniteTableState<T>, InfiniteTableAction>,
      InfiniteTableProps<T>
    >(reducer, props, getInitialState);

    const getProps = useLatest(props);
    const TableContext = getInfiniteTableContext<T>();
    const reducerActions = useMemo(
      () => getReducerActions<T>(dispatch),
      [dispatch],
    );

    const actions = {
      ...reducerActions,
    };
    const domRef = React.useRef<HTMLDivElement | null>(null);
    const bodyDOMRef = React.useRef<HTMLDivElement | null>(null);

    const bodySizeRef = useRef<Size | null>(null);
    const headerHeightRef = useRef<number>(0);

    useResizeObserver(
      bodyDOMRef,
      (size) => {
        const bodySize = {
          // TODO this can be improved
          width: size.width, //- reservedScrollSpace,
          height: size.height,
        };
        bodySize.width = bodyDOMRef.current?.scrollWidth ?? bodySize.width;

        bodySizeRef.current = bodySize;
        const props = getProps();
        if (!props.header) {
          actions.setBodySize(bodySize);
          return;
        }
        if (headerHeightRef.current) {
          actions.setBodySize(bodySize);
        } else {
          actions.setBodySize({ ...bodySize, height: 0 });
        }
      },
      { earlyAttach: true },
    );

    const onHeaderResize = useCallback((headerHeight: number) => {
      headerHeightRef.current = headerHeight;
    }, []);

    const computed = useComputed<T>(
      props,
      state,
      useDataSourceContextValue<T>(),
      actions,
    );

    const portalDOMRef = React.useRef<HTMLDivElement | null>(null);

    const contextValue: InfiniteTableContextValue<T> = {
      state,
      dispatch,
      actions,
      props,
      computed,
      domRef,
      bodyDOMRef,
      portalDOMRef,
    };
    // (globalThis as any).contextValue = contextValue;

    return (
      <React.StrictMode>
        <TableContext.Provider value={contextValue}>
          <Table {...props} ref={domRef} onHeaderResize={onHeaderResize} />
        </TableContext.Provider>
      </React.StrictMode>
    );
  };

  InfiniteTableContextProvider.defaultProps = getDefaultProps<T>();

  return InfiniteTableContextProvider;
};

export { InfiniteTableFactory };

export * from './types';
