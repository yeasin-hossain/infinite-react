import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropMultiSortBehavior,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  hobby: string;
  salary: number;
  age: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName', header: 'First Name' },
  age: { field: 'age', header: 'Age' },
  salary: {
    field: 'salary',
    header: 'Salary',
    type: 'number',
  },
  country: { field: 'country', header: 'Country' },
  preferredLanguage: { field: 'preferredLanguage' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

export default function LocalUncontrolledSingleSortingExample() {
  const [multiSortBehavior, setMultiSortBehavior] = React.useState<
    'append' | 'replace'
  >('replace');
  return (
    <>
      <div
        style={{
          background: 'var(--infinite-background)',
          color: 'var(--infinite-cell-color)',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <p style={{ padding: 10 }}>Select the multi-sort behavior</p>
        <select
          style={{
            margin: '10px 0',
            display: 'inline-block',
            background: 'var(--infinite-background)',
            color: 'var(--infinite-cell-color)',
            padding: 'var(--infinite-space-3)',
          }}
          value={multiSortBehavior}
          onChange={(event) => {
            const multiSortBehavior = event.target
              .value as InfiniteTablePropMultiSortBehavior;

            setMultiSortBehavior(multiSortBehavior);
          }}
        >
          <option value="replace">replace</option>
          <option value="append">append</option>
        </select>
      </div>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        defaultSortInfo={[]}
      >
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={120}
          multiSortBehavior={multiSortBehavior}
        />
      </DataSource>
    </>
  );
}

const dataSource: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    country: 'India',
    city: 'Unnao',
    age: 24,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    salary: 60000,
    hobby: 'sports',
    email: 'Nya44@gmail.com',
  },
  {
    id: 1,
    firstName: 'Axel',
    country: 'Mexico',
    city: 'Cuitlahuac',
    age: 46,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    salary: 100000,
    hobby: 'sports',
    email: 'Axel93@hotmail.com',
  },
  {
    id: 2,
    firstName: 'Gonzalo',
    country: 'United Arab Emirates',
    city: 'Fujairah',
    age: 24,
    currency: 'JPY',
    preferredLanguage: 'Go',
    salary: 120000,
    hobby: 'photography',
    email: 'Gonzalo_McGlynn34@gmail.com',
  },
  {
    id: 3,
    firstName: 'Sherwood',
    country: 'Mexico',
    city: 'Tlacolula de Matamoros',
    age: 24,
    currency: 'CHF',
    preferredLanguage: 'Rust',
    salary: 99000,
    hobby: 'cooking',
    email: 'Sherwood_McLaughlin65@hotmail.com',
  },
  {
    id: 4,
    firstName: 'Alexandre',
    country: 'France',
    city: 'Persan',
    age: 24,
    currency: 'EUR',
    preferredLanguage: 'Go',
    salary: 97000,
    hobby: 'reading',
    email: 'Alexandre_Harber@hotmail.com',
  },
  {
    id: 5,
    firstName: 'Mariane',
    country: 'United States',
    city: 'Hays',
    age: 23,
    currency: 'EUR',
    preferredLanguage: 'TypeScript',

    salary: 58000,
    hobby: 'cooking',
    email: 'Mariane0@hotmail.com',
  },
  {
    id: 6,
    firstName: 'Rosalind',
    country: 'Mexico',
    city: 'Nuevo Casas Grandes',
    age: 23,
    currency: 'AUD',
    preferredLanguage: 'JavaScript',
    salary: 198000,
    hobby: 'dancing',
    email: 'Rosalind69@gmail.com',
  },
  {
    id: 7,
    firstName: 'Lolita',
    country: 'Sweden',
    city: 'Delsbo',
    age: 22,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    salary: 200000,
    hobby: 'cooking',
    email: 'Lolita.Hayes@hotmail.com',
  },
  {
    id: 8,
    firstName: 'Tre',
    country: 'Germany',
    city: 'Bad Camberg',
    age: 23,
    currency: 'GBP',
    preferredLanguage: 'TypeScript',
    salary: 200000,
    hobby: 'sports',
    email: 'Tre28@gmail.com',
  },
  {
    id: 9,
    firstName: 'Lurline',
    country: 'Canada',
    city: 'Raymore',
    age: 23,
    currency: 'EUR',
    preferredLanguage: 'Rust',
    salary: 58000,
    hobby: 'sports',
    email: 'Lurline_Deckow@gmail.com',
  },
];
