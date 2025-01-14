import { test, expect } from '@testing';

export default test.describe.parallel('Pivot and grouping edge cases', () => {
  test('expect columns to be correctly set', async ({ page, columnModel }) => {
    await page.waitForInfinite(20);
    let columnIds = await columnModel.getVisibleColumnIds();

    expect(columnIds).toEqual(['id', 'firstName', 'age', 'salary', 'currency']);

    await page.click('input[name="grouped"]');

    await page.waitForTimeout(50);

    columnIds = await columnModel.getVisibleColumnIds();

    //because no groups are set, the cols should still be the same
    expect(columnIds).toEqual(['id', 'firstName', 'age', 'salary', 'currency']);

    await page.evaluate(() => {
      //@ts-ignore
      window.setGroupBy([{ field: 'country' }]);
    });

    await page.waitForTimeout(50);

    columnIds = await columnModel.getVisibleColumnIds();

    // now a group column is expected
    expect(columnIds).toEqual([
      'group-by-country',
      'id',
      'firstName',
      'age',
      'salary',
      'currency',
    ]);

    // make it also pivoted
    await page.click('input[name="pivoted"]');

    columnIds = await columnModel.getVisibleColumnIds();

    // now a group column and 2 agg cols are expected
    expect(columnIds).toEqual([
      'group-by-country',
      'total:salary',
      'total:age',
    ]);

    // now remove the grouped
    await page.click('input[name="grouped"]');

    columnIds = await columnModel.getVisibleColumnIds();

    // now only the 2 agg cols are expected
    expect(columnIds).toEqual(['total:salary', 'total:age']);

    // now remove the pivot as well to make it a simple table again
    await page.click('input[name="pivoted"]');

    expect(await columnModel.getVisibleColumnIds()).toEqual([
      'id',
      'firstName',
      'age',
      'salary',
      'currency',
    ]);
  });
});
