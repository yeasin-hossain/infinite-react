import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import '@infinite-table/infinite-react/index.css';
import { data, Person } from './data';

export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person>
        rowHeight={50}
        columns={columns}
      />
    </DataSource>
  );
}

const columns: Map<
  string,
  InfiniteTableColumn<Person>
> = new Map([
  [
    'id',
    {
      // specifies which field from the data source
      // should be rendered in this column
      field: 'Id',
      type: 'number',
      sortable: true,
      width: 80,
    },
  ],
  [
    'firstName',
    {
      field: 'FirstName',
    },
  ],
  ['age', { field: 'Age', type: 'number' }],
]);
