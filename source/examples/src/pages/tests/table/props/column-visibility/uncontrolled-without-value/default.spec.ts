import { test, expect } from '@testing';

import { getHeaderColumnIds } from '../../../../testUtils';
import { columns } from '../columns';
export default test.describe.parallel(
  'Column visibility uncontrolled without any default value',
  () => {
    test('should display all cols', async ({ page }) => {
      await page.waitForInfinite();
      const colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(Array.from(columns.keys()));
    });
  },
);
