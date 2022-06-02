import { style, styleVariants } from '@vanilla-extract/css';

import { ThemeVars } from '../theme.css';
import { left, top, pointerEvents, position } from '../utilities.css';

export const ActiveCellIndicatorBaseCls = style(
  [
    pointerEvents.none,
    position.sticky,
    left['0'],
    top['0'],
    {
      border: ThemeVars.components.Cell.activeBorder,
      background: ThemeVars.components.Cell.activeBackground,
    },
  ],
  'ActiveCellIndicator',
);

export const ActiveCellIndicatorCls = styleVariants({
  visible: [ActiveCellIndicatorBaseCls, { display: 'block' }],
  hidden: [ActiveCellIndicatorBaseCls, { display: 'none' }],
});
