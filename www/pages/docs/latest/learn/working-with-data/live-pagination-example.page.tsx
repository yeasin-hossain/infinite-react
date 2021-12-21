import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableColumn,
  DataSource,
  DataSourceSingleSortInfo,
  DataSourceDataParams,
} from '@infinite-table/infinite-react';

import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from 'react-query';
import { useCallback } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const emptyArray: Employee[] = [];

export const columns = new Map<
  string,
  InfiniteTableColumn<Employee>
>([
  ['id', { field: 'id' }],
  [
    'country',
    {
      field: 'country',
    },
  ],
  ['city', { field: 'city' }],
  ['team', { field: 'team' }],
  ['department', { field: 'department' }],
  ['firstName', { field: 'firstName' }],
  ['lastName', { field: 'lastName' }],
  ['salary', { field: 'salary' }],
  ['age', { field: 'age' }],
]);

type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  streetName: string;
  streetNo: number;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const PAGE_SIZE = 10;

const dataSource = ({
  sortInfo,
  livePaginationCursor = 0,
}: {
  sortInfo: DataSourceSingleSortInfo<Employee> | null;
  livePaginationCursor: number;
}) => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/employees10k?_limit=${PAGE_SIZE}&_sort=${
        sortInfo?.field
      }&_order=${
        sortInfo?.dir === 1 ? 'asc' : 'desc'
      }&_start=${livePaginationCursor}`
  )
    .then(async (r) => {
      const data = await r.json();
      // we need the remote count, so we take it from headers
      const total = Number(r.headers.get('X-Total-Count')!);
      return { data, total };
    })
    .then(
      ({
        data,
        total,
      }: {
        data: Employee[];
        total: number;
      }) => {
        const page = livePaginationCursor / PAGE_SIZE + 1;

        const prevPageCursor = Math.max(
          PAGE_SIZE * (page - 1),
          0
        );
        return {
          data,
          hasMore: total > PAGE_SIZE * page,
          page,
          prevPageCursor,
          nextPageCursor: prevPageCursor + data.length,
        };
      }
    )
    .then(
      (
        response
      ): Promise<{
        data: Employee[];
        hasMore: boolean;
        page: number;
        nextPageCursor: number;
        prevPageCursor: number;
      }> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(response);
          }, 150);
        });
      }
    );
};

const Example = () => {
  const [dataParams, setDataParams] = React.useState<
    Partial<DataSourceDataParams<Employee>>
  >({
    sortInfo: null,
    groupRowsBy: [],
    livePaginationCursor: 0,
  });
  const {
    data,
    fetchNextPage: fetchNext,
    isFetchingNextPage,
  } = useInfiniteQuery(
    [
      'employees',
      dataParams.sortInfo,
      dataParams.groupRowsBy,
    ],
    ({ pageParam = 0 }) => {
      const params = {
        livePaginationCursor: pageParam,
        sortInfo:
          dataParams.sortInfo as DataSourceSingleSortInfo<Employee> | null,
      };

      return dataSource(params);
    },

    {
      keepPreviousData: true,
      getPreviousPageParam: (firstPage) =>
        firstPage.prevPageCursor || 0,
      getNextPageParam: (lastPage) => {
        const nextPageCursor = lastPage.hasMore
          ? lastPage.nextPageCursor
          : undefined;

        return nextPageCursor;
      },

      select: (data) => {
        const flatData = data.pages.flatMap((x) => x.data);
        const nextPageCursor =
          data.pages[data.pages.length - 1].nextPageCursor;

        const result = {
          pages: flatData,
          pageParams: [nextPageCursor],
        };

        return result;
      },
    }
  );

  const onDataParamsChange = useCallback(
    (dataParams: DataSourceDataParams<Employee>) => {
      setDataParams(dataParams);
    },
    []
  );

  const [scrollTopId, setScrollTop] = React.useState(0);

  React.useEffect(() => {
    // when sorting changes, scroll to the top
    setScrollTop(Date.now());
  }, [dataParams.sortInfo]);

  const fetchNextPage = () => {
    if (isFetchingNextPage) {
      return;
    }

    fetchNext();
  };

  React.useEffect(() => {
    fetchNextPage();
  }, [dataParams]);

  const livePaginationCursor =
    (data?.pageParams[0] as number) || 0;

  return (
    <React.StrictMode>
      <DataSource<Employee>
        primaryKey="id"
        // take the data from `data.pages`,
        // as returned from our react-query select function

        sortInfo={dataParams?.sortInfo}
        data={data?.pages || emptyArray}
        loading={isFetchingNextPage}
        onDataParamsChange={onDataParamsChange}
        livePagination
        livePaginationCursor={livePaginationCursor}>
        <InfiniteTable<Employee>
          scrollTopId={scrollTopId}
          columnDefaultWidth={200}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

export default App;
