import { group, AggregationReducer } from '@src/utils/groupAndPivot';
import { getFilteredBy, getReducerValue, groupToItems } from './helpers';

type Person = {
  id: number;
  country: string;
  name: string;
  age: number;
  salary: number;
  team: string;
  department: string;
};

export const data: Person[] = [
  {
    id: 1,
    name: 'john',
    country: 'UK',
    department: 'it',
    age: 20,
    salary: 50000,
    team: 'backend',
  },
  {
    id: 2,
    name: 'bill',
    country: 'UK',
    department: 'it',
    age: 20,
    salary: 55000,
    team: 'backend',
  },
  {
    id: 3,
    name: 'bob',
    country: 'UK',
    department: 'it',
    age: 25,
    salary: 45000,
    team: 'components',
  },
  {
    id: 4,
    name: 'marrie',
    country: 'France',
    department: 'it',
    age: 20,
    salary: 60000,
    team: 'components',
  },
  {
    id: 5,
    name: 'espania',
    country: 'Italy',
    department: 'devops',
    age: 20,
    salary: 70000,
    team: 'infrastructure',
  },
  {
    id: 6,
    name: 'roberta',
    country: 'Spain',
    department: 'it',
    age: 20,
    salary: 30000,
    team: 'frontend',
  },
  {
    id: 7,
    name: 'marrio',
    country: 'Italy',
    department: 'devops',
    age: 25,
    salary: 40000,
    team: 'deployments',
  },
  {
    id: 8,
    name: 'juliano',
    country: 'Italy',
    department: 'devops',
    age: 20,
    salary: 39000,
    team: 'deployments',
  },
  {
    id: 9,
    name: 'fabricio',
    country: 'Italy',
    department: 'it',
    age: 25,
    salary: 100000,
    team: 'frontend',
  },
  {
    id: 10,
    name: 'matthew',
    country: 'USA',
    department: 'marketing',
    age: 44,
    salary: 80000,
    team: 'customer-satisfaction',
  },
  {
    id: 11,
    name: 'briana',
    country: 'USA',
    department: 'marketing',
    age: 50,
    salary: 90000,
    team: 'customer-satisfaction',
  },
  {
    id: 12,
    name: 'maya',
    country: 'Spain',
    department: 'devops',
    age: 44,
    salary: 85000,
    team: 'infrastructure',
  },
  {
    id: 13,
    name: 'jonathan',
    country: 'UK',
    department: 'it',
    age: 20,
    salary: 60000,
    team: 'backend',
  },
  {
    id: 14,
    name: 'Marino',
    country: 'Italy',
    department: 'devops',
    age: 21,
    salary: 60000,
    team: 'infrastructure',
  },
];

const avgReducer: AggregationReducer<Person, any> = {
  initialValue: 0,
  getter: (data) => data.salary,
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => (arr.length ? sum / arr.length : 0),
};

export default describe('Pivot', () => {
  it('should group on single field', async () => {
    const result = group(
      {
        groupBy: [{ field: 'country' }],
      },
      data,
    );

    const res = groupToItems(result);

    const byCountry = getFilteredBy(data, ['country']);

    expect(res.length).toEqual(5);
    expect(res).toEqual([
      [['UK'], byCountry('UK')],
      [['France'], byCountry('France')],
      [['Italy'], byCountry('Italy')],
      [['Spain'], byCountry('Spain')],
      [['USA'], byCountry('USA')],
    ]);
  });
  it('should group on two fields', async () => {
    const result = group(
      {
        groupBy: [{ field: 'country' }, { field: 'age' }],
      },
      data,
    );
    const res = groupToItems(result);

    const byCountryAndAge = getFilteredBy(data, ['country', 'age']);

    const expected = [
      [['UK'], byCountryAndAge('UK')],
      [['UK', 20], byCountryAndAge('UK', 20)],
      [['UK', 25], byCountryAndAge('UK', 25)],
      [['France'], byCountryAndAge('France')],
      [['France', 20], byCountryAndAge('France', 20)],
      [['Italy'], byCountryAndAge('Italy')],
      [['Italy', 20], byCountryAndAge('Italy', 20)],
      [['Italy', 25], byCountryAndAge('Italy', 25)],
      [['Italy', 21], byCountryAndAge('Italy', 21)],
      [['Spain'], byCountryAndAge('Spain')],
      [['Spain', 20], byCountryAndAge('Spain', 20)],
      [['Spain', 44], byCountryAndAge('Spain', 44)],
      [['USA'], byCountryAndAge('USA')],
      [['USA', 44], byCountryAndAge('USA', 44)],
      [['USA', 50], byCountryAndAge('USA', 50)],
    ];
    expect(res).toEqual(expected);
  });

  it('should have pivot info', () => {
    const result = group(
      {
        groupBy: [{ field: 'department' }, { field: 'team' }],
        pivot: [{ field: 'country' }, { field: 'age' }],
        reducers: [avgReducer],
      },
      data,
    );

    const devopsInfrastructure = result.deepMap.get([
      'devops',
      'infrastructure',
    ]);

    const byDepartmentTeamCountry = getFilteredBy(data, [
      'department',
      'team',
      'country',
    ]);
    const byDepartmentTeamCountryAge = getFilteredBy(data, [
      'department',
      'team',
      'country',
      'age',
    ]);

    const res = devopsInfrastructure?.pivotDeepMap?.get(['Italy', 20]);
    expect(res?.items).toEqual(
      byDepartmentTeamCountryAge('devops', 'infrastructure', 'Italy', 20),
    );

    expect(res?.reducerResults).toEqual([
      getReducerValue(res?.items!, avgReducer),
    ]);
    // see pivot.png in current folder for devops/infrastructure/Italy/20
    expect(res?.reducerResults).toEqual([70_000]);

    // see pivot.png in current folder for devops/infrastructure/Italy/25
    // which is an empty position
    expect(devopsInfrastructure?.pivotDeepMap?.get(['Italy', 25])).toEqual(
      undefined,
    );

    const resItaly = devopsInfrastructure?.pivotDeepMap?.get(['Italy']);

    expect(resItaly?.items).toEqual(
      byDepartmentTeamCountry('devops', 'infrastructure', 'Italy'),
    );

    expect(resItaly?.reducerResults).toEqual([
      getReducerValue(resItaly?.items!, avgReducer),
    ]);
    expect(resItaly?.reducerResults).toEqual([65_000]); //see pivot.png in current folder

    // now look for a value with no agg

    // const resNoAgg = itbackend?.pivotDeepMap?.get(['Italy', 25]);
  });
});
