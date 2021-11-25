import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropRowStyle,
  InfiniteTableRowInfo,
} from '@infinite-table/infinite-react';

import { columns, Employee } from './columns';

const rowStyle: InfiniteTablePropRowStyle<Employee> = ({
  data,
  rowInfo,
}: {
  data: Employee | null;
  rowInfo: InfiniteTableRowInfo<Employee>;
}) => {
  const salary = data ? data.salary : 0;

  if (salary > 150_000) {
    return { background: 'tomato' };
  }

  if (rowInfo.indexInAll % 10 === 0) {
    return { background: 'lightblue', color: 'black' };
  }
};

export default function App() {
  return (
    <DataSource<Employee> data={dataSource} primaryKey="id">
      <InfiniteTable<Employee>
        columns={columns}
        rowStyle={rowStyle}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/employees100'
  )
    .then((r) => r.json())
    .then((data: Employee[]) => {
      console.log(data);
      return data;
    });
};
