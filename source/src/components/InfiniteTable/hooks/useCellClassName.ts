import { HeaderCellVariantsType } from '../components/InfiniteTableHeader/header.css';
import { InfiniteTableComputedColumn } from '../types';

export function useCellClassName<T>(
  column: InfiniteTableComputedColumn<T>,
  baseClasses: string[],
  variants: (x: HeaderCellVariantsType) => string,
  extraFlags: { dragging: boolean },
) {
  const result = [...baseClasses];
  const variantObject: HeaderCellVariantsType = {
    first: column.computedFirst,
    last: column.computedLast,
    groupByField: !!column.groupByField,
    firstInCategory: column.computedFirstInCategory,
    lastInCategory: column.computedLastInCategory,
    pinned: column.computedPinned || false,
    dragging: extraFlags.dragging,
  };

  const theVariant = variants(variantObject);

  result.push(theVariant);

  if (column.computedFirst) {
    result.push(...baseClasses.map((c) => `${c}--first`));
  }

  if (column.groupByField) {
    result.push(...baseClasses.map((c) => `${c}--group-column`));
  }
  if (column.computedLast) {
    result.push(...baseClasses.map((c) => `${c}--last`));
  }
  if (column.computedFirstInCategory) {
    result.push(...baseClasses.map((c) => `${c}--first-in-category`));
  }
  if (column.computedLastInCategory) {
    result.push(...baseClasses.map((c) => `${c}--last-in-category`));
  }
  if (column.computedPinned) {
    result.push(
      ...baseClasses.map((c) => `${c}--pinned-${column.computedPinned}`),
    );
  } else {
    result.push(...baseClasses.map((c) => `${c}--unpinned`));
  }

  return result.filter(Boolean).join(' ');
}
