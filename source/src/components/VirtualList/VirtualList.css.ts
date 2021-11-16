import { style, styleVariants } from '@vanilla-extract/css';
import { boxSizingBorderBox } from '../InfiniteTable/utilities.css';

export const VirtualListCls = style([
  {
    position: 'relative',
    // THIS IS MANDATORY, in order to make position: fixed children relative to this container
    transform: 'translate3d(0,0,0)',
  },
  boxSizingBorderBox,
]);

export const VirtualListClsOrientation = styleVariants({
  horizontal: {},
  vertical: {
    display: 'inline-block',
  },
});

export const scrollTransformTargetCls = style({
  height: 0,
  width: 0,
  willChange: 'transform',
});
