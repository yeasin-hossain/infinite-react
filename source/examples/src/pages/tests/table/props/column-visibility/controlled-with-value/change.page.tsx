import * as React from 'react';

import {
  TableFactory,
  TableImperativeApi,
  TablePropColumnVisibility,
} from '@src/components/Table';
import DataSource from '@src/components/DataSource';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';
import { useState } from 'react';

const Table = TableFactory<Car>();

const defaultColumnVisibility: TablePropColumnVisibility = new Map([
  ['make', false],
  ['year', false],
]);

(globalThis as any).calls = [];
const onColumnVisibilityChange = (
  columnVisibility: TablePropColumnVisibility,
) => {
  (globalThis as any).calls.push(Array.from(columnVisibility.entries()));
};

const App = () => {
  const [
    columnVisibility,
    setColumnVisibility,
  ] = useState<TablePropColumnVisibility>(defaultColumnVisibility);
  return (
    <React.StrictMode>
      <DataSource<Car>
        primaryKey="id"
        data={rowData}
        fields={['id', 'make', 'model', 'price']}
      >
        <Table
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={(columnVisibility) => {
            setColumnVisibility(columnVisibility);
            onColumnVisibilityChange(columnVisibility);
          }}
          onReady={(api: TableImperativeApi<Car>) => {
            (globalThis as any).api = api;
          }}
          columnDefaultWidth={140}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
