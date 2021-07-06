import * as React from 'react';
import { useMemo, useEffect } from 'react';

import { ReactVirtualRenderer } from './ReactVirtualRenderer';
import { buildSubscriptionCallback } from '../utils/buildSubscriptionCallback';
import { AvoidReactDiff } from './AvoidReactDiff';
import { RawListProps } from './types';
import { useLatest } from '../hooks/useLatest';
import { Renderable } from '../types/Renderable';

function RawListFn(props: RawListProps) {
  const { renderItem, brain, debugChannel } = props;

  const { onRenderUpdater, renderer } = useMemo(() => {
    const onRenderUpdater = buildSubscriptionCallback<Renderable>();
    const renderer = new ReactVirtualRenderer(brain, {
      channel: debugChannel,
    });

    return { onRenderUpdater, renderer };
  }, []);

  const getRenderItem = useLatest(renderItem);

  useEffect(() => {
    const renderRange = brain.getRenderRange();

    renderer.renderRange(renderRange, {
      renderItem,
      force: true,
      onRender: onRenderUpdater,
    });
  }, [renderItem, onRenderUpdater]);

  useEffect(() => {
    const remove = brain.onRenderRangeChange((renderRange) => {
      renderer.renderRange(renderRange, {
        force: false,
        renderItem: getRenderItem(),
        onRender: onRenderUpdater,
      });
    });
    return remove;
  }, [brain, onRenderUpdater]);

  useEffect(() => {
    return () => {
      renderer.destroy();
      onRenderUpdater.destroy();
    };
  }, [renderer, onRenderUpdater]);

  return <AvoidReactDiff updater={onRenderUpdater} />;
}

export const RawList: React.FC<RawListProps> = React.memo(RawListFn);
