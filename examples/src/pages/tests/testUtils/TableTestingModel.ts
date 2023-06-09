import { Page } from '@playwright/test';
import {
  CellLocation,
  ColLocation,
  getHeaderCellWidthByColumnId,
  getHeaderColumnIds,
  getLocatorComputedStylePropertyValue,
  RowLocation,
} from '.';
import { ColumnTestingModel } from './ColumnTestingModel';
import { HeaderTestingModel } from './HeaderTestingModel';
import { RowTestingModel } from './RowTestingModel';

export class TableTestingModel {
  static get(page: Page) {
    return new TableTestingModel(page);
  }

  private page: Page;
  private rowModel: RowTestingModel;
  private columnModel: ColumnTestingModel;
  private headerModel: HeaderTestingModel;

  constructor(page: Page) {
    this.page = page;

    this.rowModel = new RowTestingModel(page);
    this.columnModel = new ColumnTestingModel(page);
    this.headerModel = new HeaderTestingModel(page);
  }

  withHeader() {
    return {
      getColumnHeaders: async () => {
        const colIds = await this.columnModel.getVisibleColumnIds();

        return await Promise.all(
          colIds.map(
            async (colId) =>
              await this.headerModel.getTextForHeaderCell({ colId }),
          ),
        );
      },
    };
  }

  async getVisibleColumnIds() {
    return await this.columnModel.getVisibleColumnIds();
  }

  withColumn(colLocation: ColLocation) {
    function getCellLocation(rowLocation: RowLocation) {
      const cellLocation: CellLocation = {
        ...rowLocation,
        ...(typeof colLocation === 'string'
          ? {
              colId: colLocation,
            }
          : colLocation),
      };

      return cellLocation;
    }
    return {
      getHeader: async () => {
        return await this.headerModel.getTextForHeaderCell(colLocation);
      },
      getCellValue: async (rowLocation: RowLocation) => {
        const cellLocation = getCellLocation(rowLocation);
        return await this.rowModel.getTextForCell(cellLocation);
      },
      getCellComputedStyleProperty: async (
        rowLocation: RowLocation,
        styleName: string,
      ) => {
        const cellLocation = getCellLocation(rowLocation);
        return await this.columnModel.getCellComputedStyleProperty(
          cellLocation,
          styleName,
        );
      },
      getHeaderComputedStyleProperty: async (styleName: string) => {
        return await getLocatorComputedStylePropertyValue({
          handle: this.headerModel.getHeaderCellLocator(colLocation),
          page: this.page,
          propertyName: styleName,
        });
      },
      clickHeader: async () => {
        await this.headerModel.clickColumnHeader(colLocation);
      },
      clickToSort: async () => {
        await this.headerModel.clickToSortColumn(colLocation);
        return;
      },
      getValues: async () => {
        return await this.rowModel.getTextForColumnCells(colLocation);
      },
      resize: async (diff: number) => {
        await this.columnModel.resizeColumn(colLocation, diff);
      },

      getWidth: async () => {
        return await getHeaderCellWidthByColumnId(colLocation, {
          page: this.page,
        });
      },
      isDisplayed: async () => {
        let colId: string = '';
        if (typeof colLocation === 'string') {
          colId = colLocation;
        } else {
          colId = colLocation.colId || '';

          if (!colId) {
            const colIndex = colLocation.colIndex || 0;
            const colIds = await getHeaderColumnIds({ page: this.page });
            colId = colIds[colIndex];
          }
        }

        return await this.columnModel.isColumnDisplayed(colId);
      },
    };
  }

  withCell(cellLocation: CellLocation) {
    return {
      getComputedStyleProperty: async (styleName: string) => {
        return await this.columnModel.getCellComputedStyleProperty(
          cellLocation,
          styleName,
        );
      },
      getRowValues: async () => {
        const rowLocator: RowLocation = cellLocation;
        const colIds = await this.columnModel.getVisibleColumnIds();

        return await Promise.all(
          colIds.map(
            async (colId) =>
              await this.rowModel.getTextForCell({
                ...rowLocator,
                colId,
              }),
          ),
        );
      },

      getColumnValues: async () => {
        return await this.rowModel.getTextForColumnCells({
          ...cellLocation,
        });
      },
    };
  }
}
