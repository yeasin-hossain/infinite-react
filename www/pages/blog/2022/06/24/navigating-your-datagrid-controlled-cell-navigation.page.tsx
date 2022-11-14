import {
  InfiniteTable,
  DataSource,
  DataSourceData,
} from '@infinite-table/infinite-react@prerelease';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react@prerelease';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

export default function KeyboardNavigationForCells() {
  const [activeCellIndex, setActiveCellIndex] = React.useState<
    [number, number] | null
  >(null);
  return (
    <>
      <div
        style={{
          color: 'var(--infinite-cell-color)',
        }}
      >
        Current active cell:{' '}
        {activeCellIndex ? (
          <>
            {activeCellIndex?.[0]}, {activeCellIndex?.[1]}
          </>
        ) : (
          'none'
        )}
        .
        <div>
          <button onClick={() => setActiveCellIndex(null)}>
            clear active cell
          </button>
        </div>
      </div>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          activeCellIndex={activeCellIndex}
          onActiveCellIndexChange={setActiveCellIndex}
          columns={columns}
        />
      </DataSource>
    </>
  );
}
