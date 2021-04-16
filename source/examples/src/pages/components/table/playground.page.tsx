import * as React from 'react';

import { TableColumn, TableFactory } from '@src/components/Table';
import DataSource from '@src/components/DataSource';

import orders from '../../../datasets/orders.json';

interface Order {
  OrderId: number;
  CompanyName: string;
  ItemCount: number;
  OrderCost: number;
  ShipCountry: string;
  ShipVia: string;
}

orders.forEach((order, i) => {
  order.OrderId = i;
});

const Table = TableFactory<Order>();

export default () => {
  const [counter, setCounter] = React.useState(0);

  return (
    <React.StrictMode>
      <div>
        <button
          onClick={() => {
            setCounter(counter + 1);
          }}
        >
          update counter
        </button>
        <DataSource<Order>
          data={orders}
          primaryKey="OrderId"
          fields={[
            'OrderId',
            'CompanyName',
            'ItemCount',
            'OrderCost',
            'ShipCountry',
            'ShipVia',
          ]}
        >
          <div>
            <Table
              domProps={{
                style: {
                  margin: '5px',
                  height: '80vh',
                  border: '1px solid gray',
                  position: 'relative',
                },
              }}
              columnDefaultWidth={200}
              columnMinWidth={100}
              columns={
                new Map(
                  [
                    {
                      field: 'OrderId',
                      type: 'number',
                      render: ({ value }: { value: any }) => {
                        return `${value} - ${counter}!`;
                      },
                    },
                    {
                      field: 'CompanyName',
                      flex: 1,
                      id: 'sss',
                    },
                    {
                      field: 'ItemCount',
                      type: 'number',
                      flex: 2,
                      align: 'center',
                    },
                    { field: 'OrderCost', type: 'number' },
                    { field: 'ShipCountry' },
                    { field: 'ShipVia' },
                  ].map((c) => [c.id ?? c.field, c as TableColumn<Order>]),
                )
              }
            />
          </div>
        </DataSource>
      </div>
    </React.StrictMode>
  );
};
