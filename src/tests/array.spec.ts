import * as pipeFuncs from '../array';
import {
  leftJoin,
  pivot,
  avg,
  sum,
  quantile,
  mean,
  variance,
  stdev,
  median,
  first,
  fullJoin,
  innerJoin,
  toObject,
  toSeries
} from '../array';

export const data = [
  { name: 'John', country: 'US', age: 32 },
  { name: 'Joe', country: 'US', age: 24 },
  { name: 'Bill', country: 'US', age: 27 },
  { name: 'Adam', country: 'UK', age: 18 },
  { name: 'Scott', country: 'UK', age: 45 },
  { name: 'Diana', country: 'UK' },
  { name: 'Marry', country: 'FR', age: 18 },
  { name: 'Luc', country: 'FR', age: null }
];

describe('Test array methods', () => {
  const testNumberArray = [2, 6, 3, 7, 11, 7, -1];
  const testNumberArraySum = 35;
  const testNumberArrayAvg = 5;

  const testAnyPrimitiveArray = ['5', 2, '33', false, true, true, true];
  const testAnyPrimitiveArraySum = 43;
  const testAnyPrimitiveArrayAvg = 6.14;
  const testAnyPrimitiveArrayMin = 0;
  const testAnyPrimitiveArrayMax = 33;

  const testObjArray = testNumberArray.map(value => ({ value }));
  const dates = [
    new Date('10/01/12'),
    new Date('10/01/10'),
    new Date('10/01/09'),
    new Date('10/01/11')
  ];

  it('count', () => {
    expect(pipeFuncs.count(testNumberArray)).toBe(testNumberArray.length);
    expect(pipeFuncs.count(testAnyPrimitiveArray)).toBe(testAnyPrimitiveArray.length);
    expect(pipeFuncs.count(testObjArray)).toBe(testObjArray.length);
    expect(pipeFuncs.count(data, i => i.country === 'US')).toBe(3);
  });

  it('sum', () => {
    expect(pipeFuncs.sum(testNumberArray)).toBe(testNumberArraySum);
    expect(pipeFuncs.sum(testAnyPrimitiveArray)).toBe(testAnyPrimitiveArraySum);
    expect(pipeFuncs.sum(testObjArray, obj => obj.value)).toBe(testNumberArraySum);
  });

  it('avg', () => {
    expect(pipeFuncs.avg(testNumberArray)).toBe(testNumberArrayAvg);
    expect(pipeFuncs.avg(testObjArray, obj => obj.value)).toBe(testNumberArrayAvg);

    const avg = pipeFuncs.avg(testAnyPrimitiveArray);
    if (avg) {
      expect(Math.round(avg * 100) / 100).toBe(testAnyPrimitiveArrayAvg);
    } else {
      throw Error('testAnyPrimitiveArray failed');
    }
  });

  it('min', () => {
    expect(pipeFuncs.min(testNumberArray)).toBe(Math.min(...testNumberArray));
    expect(pipeFuncs.min(testAnyPrimitiveArray)).toBe(testAnyPrimitiveArrayMin);
    expect(pipeFuncs.min(testObjArray, obj => obj.value)).toBe(Math.min(...testNumberArray));

    const mindate = pipeFuncs.min(dates);
    expect(mindate).toBeInstanceOf(Date);
    if (mindate instanceof Date) {
      expect(mindate.getFullYear()).toBe(2009);
    }
  });

  it('max', () => {
    expect(pipeFuncs.max(testNumberArray)).toBe(Math.max(...testNumberArray));
    expect(pipeFuncs.max(testAnyPrimitiveArray)).toBe(testAnyPrimitiveArrayMax);
    expect(pipeFuncs.max(testObjArray, obj => obj.value)).toBe(Math.max(...testNumberArray));
    expect(pipeFuncs.max([])).toBe(null);
    const maxdate = pipeFuncs.max(dates);
    expect(maxdate).toBeInstanceOf(Date);
    if (maxdate instanceof Date) {
      expect(maxdate.getFullYear()).toBe(2012);
    }
  });

  it('first', () => {
    expect(pipeFuncs.first(testNumberArray)).toBe(testNumberArray[0]);
    expect(pipeFuncs.first(testNumberArray, v => v > 6)).toBe(7);
  });

  it('last', () => {
    const last = pipeFuncs.last(data, item => item.country === 'UK');
    if (last) {
      expect(last.name).toBe('Diana');
    } else {
      throw Error('Not found');
    }
  });

  it('groupBy', () => {
    const groups = pipeFuncs.groupBy(data, item => item.country);
    expect(groups.length).toBe(3);
  });

  it('flatten', () => {
    const testArray = [1, 4, [2, [5, 5, [9, 7]], 11], 0, [], []];
    const flatten = pipeFuncs.flatten(testArray);
    expect(flatten.length).toBe(9);

    const testArray2 = [testArray, [data], [], [testAnyPrimitiveArray]];
    const flatten2 = pipeFuncs.flatten(testArray2);
    expect(flatten2.length).toBe(9 + data.length + testAnyPrimitiveArray.length);
  });

  it('flattenObject', () => {
    const testArray = [{ a: 1, d:{d1:22, d2:33} }, { b: 2, d:{d1:221, d2:331} }];
    const flatten = pipeFuncs.flattenObject(testArray);
    expect(flatten.length).toBe(2);
    expect(Object.keys(flatten[0]).join(',')).toBe('a,d.d1,d.d2');
  });

  it('unflattenObject', () => {
    const testArray = [{"a": 1, "b.e": 2,"b.c.d": 2,"b.c.f": 3,"b.f": 5},{"a": -1, "b.e": -2,"b.c.d": -2,"b.c.f": -3,"b.f": -5}];
    const unflatten = pipeFuncs.unflattenObject(testArray);
    expect(unflatten.length).toBe(2);
    expect(Object.keys(unflatten[0]).join(',')).toBe('a,b');
    expect(unflatten[0].b.c['d']).toBe(2);
    expect(unflatten[1].b.c['d']).toBe(-2);
  });

  it('countBy', () => {
    const countriesCount = pipeFuncs.countBy(data, i => i.country);
    expect(countriesCount['US']).toBe(3);
    expect(countriesCount['UK']).toBe(3);
    expect(countriesCount['FR']).toBe(2);
  });

  it('handle empty arrays', () => {
    expect(pipeFuncs.max([])).toBe(null);
    expect(pipeFuncs.max([null])).toBe(null);
    expect(pipeFuncs.max([undefined])).toBe(null);
    expect(pipeFuncs.min([])).toBe(null);
    expect(pipeFuncs.min([null])).toBe(null);
    expect(pipeFuncs.min([undefined])).toBe(null);
    expect(pipeFuncs.avg([])).toBe(null);
    expect(pipeFuncs.avg([null])).toBe(null);
    expect(pipeFuncs.avg([undefined])).toBe(null);
    expect(pipeFuncs.stdev([])).toBe(null);
    expect(pipeFuncs.first([])).toBe(null);
    expect(pipeFuncs.last([])).toBe(null);
    expect(pipeFuncs.mean([])).toBe(null);
    expect(pipeFuncs.median([])).toBe(null);
    expect(pipeFuncs.sum([])).toBe(null);
    expect(pipeFuncs.variance([])).toBe(null);
    expect(pipeFuncs.quantile([], 0)).toBe(null);
  });

  it('leftJoin', () => {
    const countries = [
      { code: 'US', capital: 'Washington' },
      { code: 'UK', capital: 'London' }
    ];
    const joinedArray = leftJoin(
      data,
      countries,
      i => i.country,
      i2 => i2.code,
      (l, r) => ({ ...r, ...l })
    );
    expect(joinedArray.length).toBe(8);
    const item = pipeFuncs.first(joinedArray, i => i.country === 'US');
    expect(item.country).toBe('US');
    expect(item.code).toBe('US');
    expect(item.capital).toBe('Washington');
    expect(item.name).toBeTruthy();
  });

  it('leftJoin 2', () => {
    const arr1 = [
      { keyField: 'k1', value1: 21 },
      { keyField: 'k2', value1: 22 },
      { keyField: 'k3', value1: 23 },
      { keyField: 'k4', value1: 24 }
    ];

    const arr2 = [
      { keyField: 'k1', value2: 31 },
      { keyField: 'k2', value2: 32 },
      { keyField: 'k5', value2: 35 },
      { keyField: 'k8', value2: 38 }
    ];

    const joinedArray = leftJoin(
      arr1,
      arr2,
      l => l.keyField,
      r => r.keyField,
      (l, r) => ({ ...r, ...l })
    );
    expect(joinedArray.length).toBe(4);
    expect(joinedArray[1].keyField).toBe('k2');
    expect(joinedArray[1].value1).toBe(22);
    expect(joinedArray[1].value2).toBe(32);
  });

  it('innerJoin', () => {
    const arr1 = [
      { keyField: 'k1', value1: 21 },
      { keyField: 'k2', value1: 22 },
      { keyField: 'k3', value1: 23 },
      { keyField: 'k4', value1: 24 }
    ];

    const arr2 = [
      { keyField: 'k1', value2: 31 },
      { keyField: 'k2', value2: 32 },
      { keyField: 'k5', value2: 35 },
      { keyField: 'k8', value2: 38 }
    ];

    const joinedArray = innerJoin(
      arr1,
      arr2,
      l => l.keyField,
      r => r.keyField,
      (l, r) => ({ ...r, ...l })
    );
    expect(joinedArray.length).toBe(2);
    expect(joinedArray[1].keyField).toBe('k2');
    expect(joinedArray[1].value1).toBe(22);
    expect(joinedArray[1].value2).toBe(32);
  });

  it('fullJoin', () => {
    const arr1 = [
      { keyField: 'k1', value1: 21 },
      { keyField: 'k2', value1: 22 },
      { keyField: 'k3', value1: 23 },
      { keyField: 'k4', value1: 24 }
    ];

    const arr2 = [
      { keyField: 'k1', value2: 31 },
      { keyField: 'k2', value2: 32 },
      { keyField: 'k5', value2: 35 },
      { keyField: 'k8', value2: 38 }
    ];

    const joinedArray = fullJoin(
      arr1,
      arr2,
      l => l.keyField,
      r => r.keyField,
      (l, r) => ({ ...r, ...l })
    );
    expect(joinedArray.length).toBe(6);
    expect(joinedArray[1].keyField).toBe('k2');
    expect(joinedArray[1].value1).toBe(22);
    expect(joinedArray[1].value2).toBe(32);
  });

  it('simple pivot', () => {
    const arr = [
      { product: 'P1', year: '2018', sale: '11' },
      { product: 'P1', year: '2019', sale: '12' },
      { product: 'P2', year: '2018', sale: '21' },
      { product: 'P2', year: '2019', sale: '22' }
    ];

    const res = pivot(arr, 'product', 'year', 'sale');
    expect(res.length).toBe(2);
    expect(res.filter(r => r.product === 'P1')[0]['2018']).toBe(11);
    expect(res.filter(r => r.product === 'P2')[0]['2018']).toBe(21);
  });

  it('pivot with default sum', () => {
    const arr = [
      { product: 'P1', year: '2018', sale: '11' },
      { product: 'P1', year: '2019', sale: '12' },
      { product: 'P1', year: '2019', sale: '22' },
      { product: 'P2', year: '2018', sale: '21' },
      { product: 'P2', year: '2019', sale: '22' }
    ];

    const res = pivot(arr, 'product', 'year', 'sale');
    expect(res.length).toBe(2);
    expect(res.filter(r => r.product === 'P1')[0]['2019']).toBe(34);
    expect(res.filter(r => r.product === 'P2')[0]['2018']).toBe(21);
  });

  it('pivot with specified AVG', () => {
    const arr = [
      { product: 'P1', year: '2018', sale: '11' },
      { product: 'P1', year: '2019', sale: '12' },
      { product: 'P1', year: '2019', sale: '22' },
      { product: 'P2', year: '2018', sale: '21' },
      { product: 'P2', year: '2019', sale: '22' }
    ];

    const res = pivot(arr, 'product', 'year', 'sale', avg);
    expect(res.length).toBe(2);
    expect(res.filter(r => r.product === 'P1')[0]['2019']).toBe(17);
    expect(res.filter(r => r.product === 'P2')[0]['2018']).toBe(21);
  });

  it('pivot with null value', () => {
    const arr = [
      { product: 'P1', year: '2018', sale: '11' },
      { product: 'P1', year: '2019', sale: '12' },
      { product: 'P1', year: '2019', sale: '22' },
      { product: 'P2', year: '2018', sale: '21' },
      { product: 'P2', year: '2019', sale: '22' },
      { product: 'P3', year: '2019', sale: '33' }
    ];

    const res = pivot(arr, 'product', 'year', 'sale', avg);
    expect(res.length).toBe(3);
    expect(res.filter(r => r.product === 'P1')[0]['2019']).toBe(17);
    expect(res.filter(r => r.product === 'P2')[0]['2018']).toBe(21);
    expect(res.filter(r => r.product === 'P3')[0]['2019']).toBe(33);
    expect(res.filter(r => r.product === 'P3')[0]['2018']).toBe(null);
  });

  it('pivot with null value with sum', () => {
    const arr = [
      { product: 'P1', year: '2018', sale: '11' },
      { product: 'P1', year: '2019', sale: '12' },
      { product: 'P1', year: '2019', sale: '22' },
      { product: 'P2', year: '2018', sale: '21' },
      { product: 'P2', year: '2019', sale: '22' },
      { product: 'P3', year: '2019', sale: '33' }
    ];

    const res = pivot(arr, 'product', 'year', 'sale', sum);
    expect(res.length).toBe(3);
    expect(res.filter(r => r.product === 'P1')[0]['2019']).toBe(34);
    expect(res.filter(r => r.product === 'P2')[0]['2018']).toBe(21);
    expect(res.filter(r => r.product === 'P3')[0]['2019']).toBe(33);
    expect(res.filter(r => r.product === 'P3')[0]['2018']).toBe(null);
  });

  it('pivot not string data value', () => {
    const arr = [
      { product: 'P1', year: '2018', notAString: 'Data11' },
      { product: 'P1', year: '2019', notAString: 'Data12' },
      { product: 'P2', year: '2018', notAString: 'Data21' },
      { product: 'P2', year: '2019', notAString: 'Data22' },
      { product: 'P3', year: '2019', notAString: 'Data33' }
    ];

    const res = pivot(arr, 'year', 'product', 'notAString', first);
    expect(res.length).toBe(2);
    // expect(res.filter(r => r.product === '2019')[0]['P1']).toBe('Data12');
    // expect(res.filter(r => r.product === 'P2')[0]['2018']).toBe('Data21');
    // expect(res.filter(r => r.product === 'P3')[0]['2019']).toBe('Data33');
    // expect(res.filter(r => r.product === 'P3')[0]['2018']).toBe(null);
  });

  it('stats quantile for sorted array', () => {
    const numbersData = [3, 1, 2, 4, 0].sort();
    expect(quantile(numbersData, 0)).toBe(0);
    expect(quantile(numbersData, 1 / 4)).toBe(1);
    expect(quantile(numbersData, 1.5 / 4)).toBe(1.5);
    expect(quantile(numbersData, 2 / 4)).toBe(2);
    expect(quantile(numbersData, 2.5 / 4)).toBe(2.5);
    expect(quantile(numbersData, 3 / 4)).toBe(3);
    expect(quantile(numbersData, 3.2 / 4)).toBe(3.2);
    expect(quantile(numbersData, 4 / 4)).toBe(4);

    const even = [3, 6, 7, 8, 8, 10, 13, 15, 16, 20];
    expect(quantile(even, 0)).toBe(3);
    expect(quantile(even, 0.25)).toBe(7.25);
    expect(quantile(even, 0.5)).toBe(9);
    expect(quantile(even, 0.75)).toBe(14.5);
    expect(quantile(even, 1)).toBe(20);

    const odd = [3, 6, 7, 8, 8, 9, 10, 13, 15, 16, 20];
    expect(quantile(odd, 0)).toBe(3);
    expect(quantile(odd, 0.25)).toBe(7.5);
    expect(quantile(odd, 0.5)).toBe(9);
    expect(quantile(odd, 0.75)).toBe(14);
    expect(quantile(odd, 1)).toBe(20);

    expect(quantile([3, 5, 10], 0.5)).toBe(5);
  });

  it('stats mean', () => {
    expect(mean([1])).toBe(1);
    expect(mean([5, 1, 2, 3, 4])).toBe(3);
    expect(mean([19, 4])).toBe(11.5);
    expect(mean([4, 19])).toBe(11.5);
    expect(mean([NaN, 1, 2, 3, 4, 5])).toBe(3);
    expect(mean([1, 2, 3, 4, 5, NaN])).toBe(3);
    expect(mean([9, null, 4, undefined, 5, NaN])).toBe(6);
  });

  it('stats variance', () => {
    expect(variance([5, 1, 2, 3, 4])).toBe(2.5);
    expect(variance([20, 3])).toBe(144.5);
    expect(variance([3, 20])).toBe(144.5);
    expect(variance([NaN, 1, 2, 3, 4, 5])).toBe(2.5);
    expect(variance([1, 2, 3, 4, 5, NaN])).toBe(2.5);
    expect(variance([10, null, 3, undefined, 5, NaN])).toBe(13);
  });

  it('stats stdev', () => {
    expect(stdev([5, 1, 2, 3, 4])).toEqual(Math.sqrt(2.5));
    expect(stdev([20, 3])).toEqual(Math.sqrt(144.5));
    expect(stdev([3, 20])).toEqual(Math.sqrt(144.5));
    expect(stdev([NaN, 1, 2, 3, 4, 5])).toEqual(Math.sqrt(2.5));
    expect(stdev([1, 2, 3, 4, 5, NaN])).toEqual(Math.sqrt(2.5));
    expect(stdev([10, null, 3, undefined, 5, NaN])).toEqual(Math.sqrt(13));
  });

  it('stats median', () => {
    expect(median([1])).toBe(1);
    expect(median([5, 1, 2, 3])).toBe(2.5);
    expect(median([5, 1, 2, 3, 4])).toBe(3);
    expect(median([20, 3])).toBe(11.5);
    expect(median([3, 20])).toBe(11.5);
    expect(median([10, 3, 5])).toBe(5);
    expect(median([NaN, 1, 2, 3, 4, 5])).toBe(3);
    expect(median([1, 2, 3, 4, 5, NaN])).toBe(3);
    expect(median([null, 3, undefined, 5, NaN, 10])).toBe(5);
    expect(median([10, null, 3, undefined, 5, NaN])).toBe(5);
  });

  it('utils sort', () => {
    let arr = pipeFuncs.sort(data, 'country DESC', 'name ASC') || [];

    expect(arr[0].name).toEqual('Bill');
    arr = pipeFuncs.sort(data, 'age ASC', 'name DESC');
    expect(arr[2].name).toBe('Marry');
    arr = pipeFuncs.sort([5, 2, 9, 4]);
    expect(arr[2]).toBe(5);

    const arrWithUndefinedProps = [
      { name: 'Tom', age: 7 },
      { name: 'Bob', age: 10 },
      { age: 5 },
      { name: 'Jerry', age: 3 }
    ];
    arr = pipeFuncs.sort(arrWithUndefinedProps, 'name ASC') || [];
    expect(arr[0].age).toBe(5);
    arr = pipeFuncs.sort(arrWithUndefinedProps, 'name DESC') || [];
    expect(arr[0].age).toBe(7);
  });

  it('toObject test', () => {
    const array = [
      { name: 'Tom', age: 7 },
      { name: 'Bob', age: 10 },
      { age: 5 },
      { name: 'Jerry', age: 3 }
    ];

    const obj1 = toObject(array, 'name');
    expect(Object.keys(obj1).length).toBe(array.length);
    expect(obj1['Bob'].age).toBe(10);
    expect(obj1['undefined'].age).toBe(5);

    const obj2 = toObject(array, i => i.name);
    expect(Object.keys(obj2).length).toBe(array.length);

    // make sure both are thesame
    expect(JSON.stringify(obj1)).toBe(JSON.stringify(obj2));
  });

  it('toObject NOT string', () => {
    const array = [
      { name: 'Tom', age: 7, date: new Date(2020, 0, 8) },
      { name: 'Bob', age: 10, date: new Date(2020, 0, 2) },
      { age: 5, date: new Date(2020, 0, 3) },
      { name: 'Jerry', age: 3, date: new Date(2020, 0, 4) }
    ];

    expect(toObject(array, i => i.age)['7'].name).toBe('Tom');
    expect(toObject(array, 'age')['7'].name).toBe('Tom');

    expect(toObject(array, i => i.date)['2020-01-02'].name).toBe('Bob');
    expect(toObject(array, 'date')['2020-01-02'].name).toBe('Bob');
  });

  it('toSeries > ', () => {
    const array = [
      { name: 'Tom', age: 7, date: new Date(2020, 0, 8) },
      { name: 'Bob', age: 10, date: new Date(2020, 0, 2) },
      { age: 5, date: new Date(2020, 0, 3) },
      { name: 'Jerry', age: 3, date: new Date(2020, 0, 4) }
    ];

    expect(toSeries(array, 'name').length).toBe(4);
    expect((toSeries(array, 'name') as any)[2]).toBe(null);
    expect((toSeries(array) as any)['name'].length).toBe(4);
    expect((toSeries(array) as any)['age'].length).toBe(4);
    expect(Object.keys(toSeries(array, ['name', 'age'])).length).toBe(2);
  });
});
