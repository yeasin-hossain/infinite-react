import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  useInfiniteColumnEditor,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { useCallback } from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

const CustomEditor = () => {
  const { initialValue, confirmEdit, cancelEdit } = useInfiniteColumnEditor();

  const domRef = React.useRef<HTMLInputElement>(null);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    if (key === 'Enter' || key === 'Tab') {
      confirmEdit(domRef.current?.value + 'ABC');
    } else if (key === 'Escape') {
      cancelEdit();
    } else {
      event.stopPropagation();
    }
  }, []);

  return (
    <div>
      <input
        style={{ width: '100%' }}
        autoFocus
        ref={domRef}
        defaultValue={initialValue}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
    components: {
      Editor: CustomEditor,
    },
  },
  age: {
    field: 'age',
    type: 'number',
    defaultEditable: false,
  },
  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer> data={data} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={{
              style: {
                height: '100%',
              },
            }}
            columnDefaultEditable
            columnDefaultWidth={150}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
