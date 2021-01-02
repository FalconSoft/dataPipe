import { parseDatetimeOrNull, parseNumberOrNull, createFieldDescriptions, dateToString } from "../utils";
import { FieldDescription, DataTypeName } from "../types";


describe('Test dataUtils', () => {
  it('parseDate', () => {
    expect(parseDatetimeOrNull('')).toBe(null);
    expect(parseDatetimeOrNull('10-1010')).toBe(null);
    let date = parseDatetimeOrNull('1111');
    if (date) {
      expect(date.getFullYear()).toBe(1970);
    }
    date = parseDatetimeOrNull('10-10-10');
    expect(date).toBeInstanceOf(Date);
    if (date) {
      expect(date.getMonth()).toBe(9);
    }
  });

  it('parseDateTime with miliseconds', () => {
    const dt = parseDatetimeOrNull('2020-06-08T13:49:15.16');
    expect(dt).toBeInstanceOf(Date);
    expect(dateToString(dt as Date)).toBe('2020-06-08T13:49:15.016Z');
    const strDate = '2020-02-21T13:49:15.967Z';
    expect(dateToString(parseDatetimeOrNull(strDate) as Date)).toBe(strDate);
  });

  it('parseDateTime with format', () => {
    const dt = parseDatetimeOrNull('20200608', 'yyyyMMdd');
    expect(dt).toBeInstanceOf(Date);
    expect(dateToString(dt as Date)).toBe('2020-06-08');   
    expect(dateToString(parseDatetimeOrNull('202006', 'yyyyMM') as Date)).toBe('2020-06-01');
    expect(dateToString(parseDatetimeOrNull('06/02/2020', 'MM/dd/yyyy') as Date)).toBe('2020-06-02');
    expect(dateToString(parseDatetimeOrNull('06/02/2020', 'dd/MM/yyyy') as Date)).toBe('2020-02-06');
    expect(dateToString(parseDatetimeOrNull('2020-06-02', 'yyyy-mm-dd') as Date)).toBe('2020-06-02');
  });

  it('parseNumber', () => {
    expect(parseNumberOrNull('')).toBe(null);
    expect(parseNumberOrNull('11')).toBe(11);
    expect(parseNumberOrNull('11.1')).toBe(11.1);
    expect(parseNumberOrNull('-11.1')).toBe(-11.1);
    expect(parseNumberOrNull(11.1)).toBe(11.1);
    expect(parseNumberOrNull(NaN)).toBe(NaN);
  })

  it('createFieldDescriptions', () => {
    const arr = [2, 4, 5].map(r => ({ val1: r }));
    const ff = createFieldDescriptions(arr);
    expect(ff.length).toBe(1);
    expect(ff[0].fieldName).toBe('val1');
    expect(ff[0].dataTypeName).toBe(DataTypeName.WholeNumber);
    expect(ff[0].isNullable).toBe(false);
  });

  it('createFieldDescriptions2', () => {
    const arr = [2, '4', 5].map(r => ({ val1: r }));
    const ff = createFieldDescriptions(arr);
    expect(ff.length).toBe(1);
    expect(ff[0].fieldName).toBe('val1');
    expect(ff[0].dataTypeName).toBe(DataTypeName.WholeNumber);
    expect(ff[0].isNullable).toBe(false);
  });

  it('createFieldDescriptions numbers check', () => {
    const mapFn = (r: any): any => ({ val1: r });
    const fdFn = (arr: any[]): FieldDescription => createFieldDescriptions(arr.map(mapFn))[0];

    expect(fdFn([2, 4, 5]).dataTypeName).toBe(DataTypeName.WholeNumber);
    expect(fdFn([2, 4, 5]).isNullable).toBe(false);
    expect(fdFn([2, 4, null, 5]).dataTypeName).toBe(DataTypeName.WholeNumber);
    expect(fdFn([2, 4, null, 5]).isNullable).toBe(true);
    expect(fdFn([2, 4.3, 5]).dataTypeName).toBe(DataTypeName.FloatNumber);
    expect(fdFn([2, 4.3, null, 5]).dataTypeName).toBe(DataTypeName.FloatNumber);
    expect(fdFn([2, 2147483699, 5]).dataTypeName).toBe(DataTypeName.BigIntNumber);
    expect(fdFn([2, 2147483699, null, 5]).dataTypeName).toBe(DataTypeName.BigIntNumber);
    expect(fdFn([2, '4', 5]).dataTypeName).toBe(DataTypeName.WholeNumber);
  });

  it('createFieldDescriptions DateTime check', () => {
    const mapFn = (r: any): any => ({ val1: r });
    const fdFn = (arr: any[]): FieldDescription => createFieldDescriptions(arr.map(mapFn))[0];

    expect(fdFn(['2019-01-01', '2019-01-02']).dataTypeName).toBe(DataTypeName.DateTime);
    expect(fdFn(['2019-01-01', '2019-01-02']).isNullable).toBe(false);
    expect(fdFn(['2019-01-01', null, '2019-01-02']).dataTypeName).toBe(DataTypeName.DateTime);
    expect(fdFn(['2019-01-01', null, '2019-01-02']).isNullable).toBe(true);
    expect(fdFn([new Date(2001, 1, 1), new Date()]).dataTypeName).toBe(DataTypeName.DateTime);

    expect(fdFn(['2019-01-01', 'NOT A DATE', '2019-01-02']).dataTypeName).toBe(DataTypeName.String);
    expect(fdFn(['2019-01-01', 76, '2019-01-02']).dataTypeName).toBe(DataTypeName.String);
    expect(fdFn(['2019-01-01', 76, false, '2019-01-02']).dataTypeName).toBe(DataTypeName.String);
    expect(fdFn(['2019-01-01', 76, false, null, '2019-01-02']).dataTypeName).toBe(DataTypeName.String);
    expect(fdFn([new Date(2001, 1, 1), 'NOT A DATE', new Date()]).dataTypeName).toBe(DataTypeName.String);
  });

  it('createFieldDescriptions size check', () => {
    const mapFn = (r: any): any => ({ val1: r });
    const fdFn = (arr: any[]): FieldDescription => createFieldDescriptions(arr.map(mapFn))[0];

    const longestText = 'Longest Text';
    expect(fdFn(['Test1', 'Longer', longestText]).maxSize).toBe(longestText.length);
    expect(fdFn(['Test1', longestText, 'Longer']).maxSize).toBe(longestText.length);
    expect(fdFn(['Test1', longestText, null, 'Longer']).maxSize).toBe(longestText.length);
    expect(fdFn([87, longestText, '2019-01-01']).maxSize).toBe(longestText.length);
    expect(fdFn([87, longestText, '2019-01-01']).dataTypeName).toBe(DataTypeName.String);
  });

})

