import { test, expect } from '@testing';

export default test.describe.parallel('Date sorting', () => {
  test('should be fine', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const order = ['11/2/2020', '11/24/2020', '4/4/2021', '6/24/2023'];

    const dateCol = tableModel.withColumn('shipDate');

    await dateCol.clickToSort();
    expect(await dateCol.getValues()).toEqual(order);

    await dateCol.clickToSort();
    expect(await dateCol.getValues()).toEqual([...order].reverse());
  });
});
