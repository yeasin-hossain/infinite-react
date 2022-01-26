import { style, styleVariants } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { ThemeVars } from '../theme.css';
import {
  alignItems,
  background,
  display,
  flexFlow,
  height,
  position,
  top,
  whiteSpace,
  willChange,
} from '../utilities.css';

export const columnAlignCellStyle = styleVariants({
  center: { justifyContent: 'center' },
  start: { justifyContent: 'flex-start' },
  end: { justifyContent: 'flex-end' },
});

export const CellBorderObject = {
  borderLeft: `${ThemeVars.components.Cell.borderWidth} solid transparent`,
  borderRight: `${ThemeVars.components.Cell.borderWidth} solid transparent`,
};

export const CellClsVariants = styleVariants({
  shifting: {
    transition: 'left 300ms',
  },
  dragging: {
    transition: 'none',
  },
});
export const CellCls = style([
  display.flex,
  flexFlow.row,
  alignItems.center,
  position.absolute,
  willChange.transform,
  whiteSpace.nowrap,
  {
    padding: ThemeVars.components.Cell.padding,
    ...CellBorderObject,
  },
]);

export const ColumnCellVariantsObject = {
  first: {
    borderTopLeftRadius: ThemeVars.components.Cell.borderRadius,
    borderBottomLeftRadius: ThemeVars.components.Cell.borderRadius,
  },
  last: {
    borderTopRightRadius: ThemeVars.components.Cell.borderRadius,
    borderBottomRightRadius: ThemeVars.components.Cell.borderRadius,
  },
  groupByField: {},
  firstInCategory: {},
  lastInCategory: {},
  pinnedStart: {},
  pinnedEnd: {},
  unpinned: {},
  pinnedStartLastInCategory: {
    borderRight: ThemeVars.components.Cell.border,
    vars: {
      // [ThemeVars.components.Cell.border]:
      //   ThemeVars.components.Cell.borderInvisible,
    },
  },
  pinnedEndFirstInCategory: {
    borderLeft: ThemeVars.components.Cell.border,
    vars: {
      [ThemeVars.components.Cell.border]:
        ThemeVars.components.Cell.borderInvisible,
    },
  },
};

export const ColumnCellRecipe = recipe({
  base: [position.absolute, height['100%'], background.inherit, top['0']],
  variants: {
    dragging: { false: {} },
    first: {
      true: {
        borderTopLeftRadius: ThemeVars.components.Cell.borderRadius,
        borderBottomLeftRadius: ThemeVars.components.Cell.borderRadius,
      },
      false: {},
    },
    last: {
      true: {
        borderTopRightRadius: ThemeVars.components.Cell.borderRadius,
        borderBottomRightRadius: ThemeVars.components.Cell.borderRadius,
      },
      false: {},
    },
    groupByField: {
      true: ColumnCellVariantsObject.groupByField,
      false: {},
    },
    firstInCategory: {
      true: ColumnCellVariantsObject.firstInCategory,
      false: {},
    },
    lastInCategory: {
      true: ColumnCellVariantsObject.lastInCategory,
      false: {},
    },
    pinned: {
      start: {},
      end: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: {
        pinned: 'start',
        lastInCategory: true,
      },
      style: ColumnCellVariantsObject.pinnedStartLastInCategory,
    },

    {
      variants: {
        pinned: 'end',
        firstInCategory: true,
      },
      style: ColumnCellVariantsObject.pinnedEndFirstInCategory,
    },
  ],
});
