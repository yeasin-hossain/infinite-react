import { Page, ElementHandle } from '@playwright/test';

import { sortElements } from './listUtils';

export const wait = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
};

type FnCall = {
  args: any[];
};

export const getGlobalFnCalls =
  (fnName: string) => async (): Promise<FnCall[]> => {
    return await page.evaluate((name: string) => {
      return (window as any)[name].getCalls().map((c: any) => {
        return {
          args: c.args as any[],
        };
      });
    }, fnName);
  };

export const getHeaderCellByColumnId = async (
  columnId: string,
  { page }: { page: Page },
) => {
  return await page.$(`.InfiniteHeader [data-column-id="${columnId}"]`);
};

export const getHeaderCellWidthByColumnId = async (
  columnId: string,
  { page }: { page: Page },
): Promise<number> => {
  const node = await getHeaderCellByColumnId(columnId, { page });

  const value = await node!.evaluate(
    (node) => node.getBoundingClientRect().width,
  );
  return value;
};

export const getColumnWidths = async (
  colIds: string[],
  { page }: { page: Page },
) => {
  return await Promise.all(
    colIds.map(async (id) => {
      return await getHeaderCellWidthByColumnId(id, { page });
    }),
  );
};

export const getHeaderColumnCells = async ({ page }: { page: Page }) => {
  const cells = await page.$$(`.InfiniteHeader [data-name="Cell"]`);

  const result = await sortElements(cells);

  return result;
};

export const getColumnCells = async (
  columnName: string,
  { page }: { page: Page },
) => {
  const [headerCell, ...bodyCells] = await page.$$(
    `[data-column-id="${columnName}"]`,
  );

  const cells = await sortElements(bodyCells);

  return {
    headerCell,
    bodyCells: cells,
  };
};

export const getCellText = async (
  {
    columnId,
    rowIndex,
  }: {
    columnId: string;
    rowIndex: number;
  },
  { page }: { page: Page },
) => {
  const cell = await page.$(
    `[data-row-index="${rowIndex}"] [data-column-id="${columnId}"]`,
  );

  return await cell!.evaluate((node) => (node as HTMLElement).innerText);
};

export const getHeaderColumnIds = async ({ page }: { page: Page }) => {
  let cells = await getHeaderColumnCells({ page });

  const result = Promise.all(
    cells.map((cell: any) =>
      cell.evaluate((node: any) => node.getAttribute('data-column-id')),
    ),
  );

  await Promise.all(
    cells.map(async (cell: ElementHandle<HTMLElement | SVGElement>) => {
      return await cell.dispose();
    }),
  );

  return result;
};

const COL_GROUP_SELECTOR = '[data-group-id]';
export async function getColumnGroupNodes() {
  return await page.$$(COL_GROUP_SELECTOR);
}

export async function getColumnGroupNodeForGroup(groupId: string) {
  return await page.$$eval(
    COL_GROUP_SELECTOR,
    (nodes, groupId) =>
      [...nodes].filter(
        (node) => (node as HTMLElement).dataset.groupId === groupId,
      ),
    groupId,
  );
}
export async function getColumnGroupsIds() {
  return await page.$$eval(COL_GROUP_SELECTOR, (nodes) =>
    [...nodes].map((node) => (node as HTMLElement).dataset.groupId),
  );
}
