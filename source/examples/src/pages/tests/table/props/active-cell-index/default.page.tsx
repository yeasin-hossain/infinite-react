import {
  InfiniteTable,
  DataSource,
  DataSourceData,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import { CSSProperties } from '@vanilla-extract/css';

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
  return fetch(
    'https://infinite-table.com/.netlify/functions/json-server' +
      `/developers1k-sql?`,
  )
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

export default function KeyboardNavigationForRows() {
  const [color, setColor] = useState({
    r: 77,
    // r: 255,
    g: 0,
    // g: 0,
    b: 215,
    // b: 0,
  });

  const defaultColor = `#${color.r.toString(16)}${color.g.toString(
    16,
  )}${color.b.toString(16)}`;

  const domProps = useMemo(() => {
    return {
      style: {
        height: '90vh',
        '--infinite-active-cell-border-color--r': color.r,
        '--infinite-active-cell-border-color--g': color.g,
        '--infinite-active-cell-border-color--b': color.b,
      },
    };
  }, [color]);

  const onColorChange = (event: any) => {
    const color = event.target.value;

    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);

    setColor({
      r,
      g,
      b,
    });
  };

  console.log(color, domProps.style);
  return (
    <div
      style={
        {
          // '--infinite-active-cell-background': 'unset',
          // '--infinite-active-cell-border': '10px dashed blue',
          // '--infinite-active-cell-border-style': 'solid',
          // '--infinite-active-cell-border-width': '5px',
          // '--infinite-active-row-border-style': 'dashed',
          '--infinite-active-cell-border-width': '3px',
          // '--infinite-active-row-border-color': 'yellow',
          // '--infinite-active-row-background': 'red',
          // '--infinite-row-background-alpha': '1',
          // '--infinite-active-row-background-alpha--table-unfocused': '0.3',
          // '--infinite-active-cell-background-alpha--table-unfocused': '0.8',
          // '--infinite-active-cell-background-alpha': '1',
        } as CSSProperties
      }
    >
      <input />
      <div>
        <input
          type="color"
          onChange={onColorChange}
          defaultValue={defaultColor}
        />
      </div>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          keyboardNavigation="row"
          defaultActiveRowIndex={8}
        />
      </DataSource>
      <input />
    </div>
  );
}
