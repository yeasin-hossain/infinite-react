import { InfiniteTableImperativeApi } from '@infinite-table/infinite-react';
import { getHeaderColumnIds } from '../../../../../../utils';

export default describe('Column order uncontrolled', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-order/uncontrolled-with-value`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should display specified cols correctly', async () => {
    await page.waitForTimeout(20);
    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'model', 'price', 'year']);

    await page.waitForTimeout(30);
    await page.evaluate(() => {
      ((window as any).api as InfiniteTableImperativeApi<any>).setColumnOrder([
        'make',
        'model',
      ]);
    });

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['make', 'model']);

    await page.evaluate(() => {
      ((window as any).api as InfiniteTableImperativeApi<any>).setColumnOrder([
        'id',
        'rating',
      ]);
    });

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'rating']);

    expect(await page.evaluate(() => (window as any).calls)).toEqual([
      ['make', 'model'],
      ['id', 'rating'],
    ]);
  });
});
