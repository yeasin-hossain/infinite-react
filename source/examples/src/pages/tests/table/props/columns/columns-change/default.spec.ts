import { test, expect } from '@playwright/test';

import { getHeaderColumnIds } from '../../../../testUtils';

export default test.describe.parallel('Detect columns change', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/columns/columns-change/default`);
  });

  test('expect columns are correctly set when updated on useEffect', async ({
    page,
  }) => {
    await page.waitForSelector('[data-column-id]');

    const colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['identifier', 'firstName', 'age']);
  });
});
