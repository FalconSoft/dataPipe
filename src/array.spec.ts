import * as pipeFuncs from './array';
import { leftJoin } from './array-joins';

export const data = [
  { name: "John", country: "US" }, { name: "Joe", country: "US" }, { name: "Bill", country: "US" }, { name: "Adam", country: "UK" },
  { name: "Scott", country: "UK" }, { name: "Diana", country: "UK" }, { name: "Marry", country: "FR" }, { name: "Luc", country: "FR" }
]

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
  const dates = [new Date('10/01/12'), new Date('10/01/10'), new Date('10/01/09'), new Date('10/01/11')]

  it('count', () => {
    expect(pipeFuncs.count(testNumberArray)).toBe(testNumberArray.length);
    expect(pipeFuncs.count(testAnyPrimitiveArray)).toBe(testAnyPrimitiveArray.length);
    expect(pipeFuncs.count(testObjArray)).toBe(testObjArray.length);
    expect(pipeFuncs.count(data, i => i.country === 'US')).toBe(3);
  })

  it('sum', () => {
    expect(pipeFuncs.sum(testNumberArray)).toBe(testNumberArraySum);
    expect(pipeFuncs.sum(testAnyPrimitiveArray)).toBe(testAnyPrimitiveArraySum);
    expect(pipeFuncs.sum(testObjArray, obj => obj.value)).toBe(testNumberArraySum);
  })

  it('avg', () => {
    expect(pipeFuncs.avg(testNumberArray)).toBe(testNumberArrayAvg);
    expect(pipeFuncs.avg(testObjArray, obj => obj.value)).toBe(testNumberArrayAvg);

    const avg = pipeFuncs.avg(testAnyPrimitiveArray);
    if (avg !== undefined) {
      expect(Math.round(avg * 100) / 100).toBe(testAnyPrimitiveArrayAvg);
    } else {
      throw Error('testAnyPrimitiveArray failed');
    }
  })

  it('min', () => {
    expect(pipeFuncs.min(testNumberArray)).toBe(Math.min(...testNumberArray));
    expect(pipeFuncs.min(testAnyPrimitiveArray)).toBe(testAnyPrimitiveArrayMin);
    expect(pipeFuncs.min(testObjArray, obj => obj.value)).toBe(Math.min(...testNumberArray));
    const mindate = pipeFuncs.min(dates);
    expect(mindate).toBeInstanceOf(Date);
    if (mindate instanceof Date) {
      expect(mindate.getFullYear()).toBe(2009)
    }
  })

  it('max', () => {
    expect(pipeFuncs.max(testNumberArray)).toBe(Math.max(...testNumberArray));
    expect(pipeFuncs.max(testAnyPrimitiveArray)).toBe(testAnyPrimitiveArrayMax);
    expect(pipeFuncs.max(testObjArray, obj => obj.value)).toBe(Math.max(...testNumberArray));
    const maxdate = pipeFuncs.max(dates);
    expect(maxdate).toBeInstanceOf(Date);
    if (maxdate instanceof Date) {
      expect(maxdate.getFullYear()).toBe(2012)
    }
  })

  it('first', () => {
    expect(pipeFuncs.first(testNumberArray)).toBe(testNumberArray[0]);
    expect(pipeFuncs.first(testNumberArray, v => v > 6)).toBe(7);
  })

  it('last', () => {
    const last = pipeFuncs.last(data, item => item.country === 'UK');
    if (last) {
      expect(last.name).toBe('Diana');
    } else {
      throw Error('Not found');
    }
  })

  it('groupBy', () => {
    const groups = pipeFuncs.groupBy(data, item => item.country);
    expect(groups.length).toBe(3);
  })

  it('flatten', () => {
    const testArray = [1, 4, [2, [5, 5, [9, 7]], 11], 0, [], []];
    const flatten = pipeFuncs.flatten(testArray);
    expect(flatten.length).toBe(9);

    const testArray2 = [testArray, [data], [], [testAnyPrimitiveArray]];
    const flatten2 = pipeFuncs.flatten(testArray2);
    expect(flatten2.length).toBe(9 + data.length + testAnyPrimitiveArray.length);
  })

  it('countBy', () => {
    const countriesCount = pipeFuncs.countBy(data, i => i.country);
    expect(countriesCount['US']).toBe(3);
    expect(countriesCount['UK']).toBe(3);
    expect(countriesCount['FR']).toBe(2);
  });

  it('joinArray', () => {
    const countries = [{ code: 'US', capital: 'Washington' }, { code: 'UK', capital: 'London' }];
    const joinedArray = leftJoin(data, countries, i => i.country, i2 => i2.code, (l, r) => ({ ...r, ...l }));
    expect(joinedArray.length).toBe(8);
    const item = pipeFuncs.first(joinedArray, i => i.country === 'US');
    expect(item.country).toBe('US');
    expect(item.code).toBe('US');
    expect(item.capital).toBe('Washington');
    expect(item.name).toBeTruthy();
  })
})
