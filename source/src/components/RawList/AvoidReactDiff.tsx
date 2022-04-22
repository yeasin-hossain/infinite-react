import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import type { Renderable } from '../types/Renderable';
import type { SubscriptionCallback } from '../types/SubscriptionCallback';

export type AvoidReactDiffProps = {
  name?: string;
  useraf?: boolean;
  updater: SubscriptionCallback<Renderable>;
};

function AvoidReactDiffFn(props: AvoidReactDiffProps) {
  const [children, setChildren] = useState<Renderable>(props.updater.get);

  const rafId = useRef<any>(null);

  useEffect(() => {
    function onChange(children: Renderable) {
      // so when updater triggers a change
      // we can re-render and set the children

      if (props.useraf) {
        if (rafId.current != null) {
          cancelAnimationFrame(rafId.current);
        }
        rafId.current = requestAnimationFrame(() => {
          setChildren(children);
        });
      } else {
        setChildren(children);
      }
    }
    const remove = props.updater.onChange(onChange);

    return () => {
      if (rafId.current != null) {
        cancelAnimationFrame(rafId.current);
      }
      remove();
    };
  }, [props.updater, props.useraf]);

  return (children as React.ReactNode) ?? null;
}

//@ts-ignore
export const AvoidReactDiff = React.memo(AvoidReactDiffFn);
