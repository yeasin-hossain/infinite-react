import * as React from 'react';
import { CSSProperties, useCallback } from 'react';

import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useInfiniteTable } from '../hooks/useInfiniteTable';

import { focusLastFocusableCell } from '../utils/cellFocusUtils';

const style: CSSProperties = {
  width: 0,
  height: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  outline: 'none',
  zIndex: -1,
};

export function FocusDetect<T>() {
  const {
    getState,
    imperativeApi: api,
    componentActions: actions,
    getComputed,
  } = useInfiniteTable<T>();
  const { getState: getDataSourceState } = useDataSourceContextValue<T>();

  const { focusDetectDOMRef } = getState();

  const onFocus = useCallback(async () => {
    // this should only be focused when the user is shift+tabbing back into the table
    // so we have to focus the last contentFocusable cell in the grid at this point

    const context = {
      getDataSourceState,
      getComputed,
      actions,
      api,
      getState,
    };

    focusLastFocusableCell(context);
  }, []);
  return (
    <div
      onFocus={onFocus}
      ref={focusDetectDOMRef}
      tabIndex={0}
      style={style}
    ></div>
  );
}
