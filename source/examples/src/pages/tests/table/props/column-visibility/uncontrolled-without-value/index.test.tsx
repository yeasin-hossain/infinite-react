import { columns } from '../columns';
import { getHeaderColumnIds } from '../../../../../../utils';

export default describe('Column visibility uncontrolled without any default value', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-visibility/uncontrolled-without-value`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should display all cols', async () => {
    const colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(Array.from(columns.keys()));
  });
});
