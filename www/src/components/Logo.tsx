import * as React from 'react';

export function Logo(props: JSX.IntrinsicElements['img']) {
  return <img src="/logo-infinite.svg" className="mr-2" {...props} />;
}

Logo.displayName = 'Logo';
