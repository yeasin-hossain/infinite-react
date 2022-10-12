import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTablePropColumns,
  GroupRowsState,
  DataSourceGroupBy,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';
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

const domProps = {
  style: {
    height: '80vh',
  },
};
const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    name: 'Salary (avg)',
    field: 'salary',
    reducer: 'avg',
  },
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [['France'], ['Canada']],
  collapsedRows: true,
  // expandedRows: true,
  // collapsedRows: [],
});
export default function RemoteGroupByExample() {
  const groupBy: DataSourceGroupBy<Developer>[] = React.useMemo(
    () => [
      { field: 'country' },
      // {
      //   field: 'city',
      // },
    ],
    [],
  );

  return (
    <DataSource<Developer>
      primaryKey="id"
      lazyLoad
      data={dataSource}
      groupBy={groupBy}
      defaultGroupRowsState={groupRowsState}
      aggregationReducers={aggregationReducers}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columns={columns}
        columnDefaultWidth={220}
      />
    </DataSource>
  );
}

const dataSource: DataSourceData<Developer> = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  groupKeys = [],
  sortInfo,
}) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }

  const args = [
    pivotBy
      ? 'pivotBy=' + JSON.stringify(pivotBy.map((p) => ({ field: p.field })))
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field })))
      : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,

    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL_FOR_TESTS + `/developers10-sql?` + args,
  )
    .then((r) => r.json())
    .then(
      (data) =>
        new Promise((resolve) => {
          // setTimeout(() => {

          data.data.forEach((item: any) => {
            if (JSON.stringify(item.keys) === JSON.stringify(['France'])) {
              item.dataset = {
                data: [
                  {
                    id: 4,
                    companyName: 'Langworth Inc',
                    companySize: '0 - 10',
                    firstName: 'Alexandre',
                    lastName: 'Harber',
                    country: 'France',
                    countryCode: 'FR',
                    city: 'Persan',
                    streetName: 'Runte Mountain',
                    streetPrefix: 'Loop',
                    streetNo: 959,
                    age: 35,
                    currency: 'EUR',
                    preferredLanguage: 'Go',
                    reposCount: 10,
                    stack: 'backend',
                    canDesign: 'yes',
                    salary: 97000,
                    hobby: 'reading',
                    email: 'Alexandre_Harber@hotmail.com',
                  },
                ],
                totalCount: 1,
                cache: true,
              };
            }
          });
          console.log(data);
          resolve(data);
          // }, 1150);
        }),
    );
};
