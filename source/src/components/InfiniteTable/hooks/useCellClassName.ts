import { InfiniteTableComputedColumn } from '../types';

export function useCellClassName<T>(
  column: InfiniteTableComputedColumn<T>,
  baseClasses: string[],
) {
  const result = [...baseClasses];
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

  return result.join(' ');
}
