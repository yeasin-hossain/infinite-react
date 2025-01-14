import * as React from 'react';
import { useEffect, useLayoutEffect, useMemo } from 'react';

import { AvoidReactDiff } from '../RawList/AvoidReactDiff';
import { Renderable } from '../types/Renderable';
import { SubscriptionCallback } from '../types/SubscriptionCallback';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { MatrixBrain } from '../VirtualBrain/MatrixBrain';

import {
  ReactHeadlessTableRenderer,
  TableRenderCellFn,
} from './ReactHeadlessTableRenderer';

export type RawTableProps = {
  name?: string;
  brain: MatrixBrain;
  renderCell: TableRenderCellFn;
  cellHoverClassNames?: string[];
  renderer?: ReactHeadlessTableRenderer;
  onRenderUpdater?: SubscriptionCallback<Renderable>;
};

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
export function RawTableFn(props: RawTableProps) {
  const { brain, renderCell } = props;

  const { renderer, onRenderUpdater } = useMemo(() => {
    return props.onRenderUpdater && props.renderer
      ? {
          renderer: props.renderer,
          onRenderUpdater: props.onRenderUpdater,
        }
      : createRenderer(brain);
  }, [brain, props.onRenderUpdater, props.renderer]);

  useEffect(() => {
    renderer.cellHoverClassNames = props.cellHoverClassNames || [];
  }, [renderer, props.cellHoverClassNames]);

  // we need to useLayoutEffect here instead of useEffect!
  // as otherwise sometimes column headers might not be rendered correctly
  //
  // For example, for http://localhost:3000/tests/table/props/column/column-change
  // sometimes firstName and salary are not displayed!!!! in the column header if `useEffect` is used

  useLayoutEffect(() => {
    const renderRange = brain.getRenderRange();

    renderer.renderRange(renderRange, {
      onRender: onRenderUpdater,
      force: true,
      renderCell,
    });
  }, [renderer, brain, renderCell, onRenderUpdater]);

  useEffect(() => {
    const remove = brain.onRenderRangeChange((renderRange) => {
      renderer.renderRange(renderRange, {
        force: false, // TODO should be false
        onRender: (items) => {
          const currentItems = onRenderUpdater.get();
          if (
            currentItems &&
            items &&
            (currentItems as any).length === items.length
          ) {
            // dont update, as each item in turn
            // is an AvoidReactDiff component
            // which is updating itself
            return;
          }
          onRenderUpdater(items);
        },
        renderCell,
      });
    });

    return remove;
  }, [renderCell]);

  return <AvoidReactDiff updater={onRenderUpdater} />;
}

export const RawTable: React.FC<RawTableProps> = React.memo(RawTableFn);
