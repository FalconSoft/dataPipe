import {
  parseDatetimeOrNull,
  parseNumberOrNull,
  getFieldsInfo,
  dateToString,
  addBusinessDays
} from '../utils';
import { FieldDescription, DataTypeName } from '../types';

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

  it('parseDateTime 1', () => {
    const dt = parseDatetimeOrNull('06-Aug-2020');
    expect(dt).toBeInstanceOf(Date);

    const dt2 = parseDatetimeOrNull('8=FIX.4.4^9=58^35=0^49=BuySide^56=SellSide^34=3^52=20190605-12:29:20.259^10=172^');
    expect(dt2).toBeNull();
  });  

  it('parseDateTime with larger miliseconds', () => {
    const dt = parseDatetimeOrNull('2020-06-08T13:49:15.16789');
    expect(dt).toBeInstanceOf(Date);
    expect(dateToString(dt as Date)).toBe('2020-06-08T13:49:15.167Z');
    const strDate = '2020-02-21T13:49:15.167Z';
    expect(dateToString(parseDatetimeOrNull(strDate) as Date)).toBe(strDate);
  });

  it('parseDateTime with format', () => {
    const dt = parseDatetimeOrNull('20200608', 'yyyyMMdd');
    expect(dt).toBeInstanceOf(Date);
    expect(dateToString(dt as Date)).toBe('2020-06-08');
    expect(dateToString(parseDatetimeOrNull('202006', 'yyyyMM') as Date)).toBe('2020-06-01');
    expect(dateToString(parseDatetimeOrNull('06/02/2020', 'MM/dd/yyyy') as Date)).toBe(
      '2020-06-02'
    );
    expect(dateToString(parseDatetimeOrNull('06/02/2020', 'dd/MM/yyyy') as Date)).toBe(
      '2020-02-06'
    );
    expect(dateToString(parseDatetimeOrNull('2020-06-02', 'yyyy-mm-dd') as Date)).toBe(
      '2020-06-02'
    );
  });

  it('last business date', () => {
    const dt = parseDatetimeOrNull('20210111', 'yyyyMMdd');
    expect(dt).toBeInstanceOf(Date);
    expect(dateToString(dt as Date, 'yyyyMMdd')).toBe('20210111');
    expect(dateToString(addBusinessDays(dt as Date, -1), 'yyyyMMdd')).toBe('20210108');
  });

  it('parseNumber', () => {
    expect(parseNumberOrNull('')).toBe(null);
    expect(parseNumberOrNull('11')).toBe(11);
    expect(parseNumberOrNull('11.1')).toBe(11.1);
    expect(parseNumberOrNull('-11.1')).toBe(-11.1);
    expect(parseNumberOrNull(11.1)).toBe(11.1);
    expect(parseNumberOrNull(NaN)).toBe(NaN);
  });

  it('getFieldsInfo', () => {
    const arr = [2, 4, 5].map(r => ({ val1: r }));
    const ff = getFieldsInfo(arr);
    expect(ff.length).toBe(1);
    expect(ff[0].fieldName).toBe('val1');
    expect(ff[0].dataTypeName).toBe(DataTypeName.WholeNumber);
    expect(ff[0].isNullable).toBe(false);
  });

  it('getFieldsInfo2', () => {
    const arr = [2, '4', 5].map(r => ({ val1: r }));
    const ff = getFieldsInfo(arr);
    expect(ff.length).toBe(1);
    expect(ff[0].fieldName).toBe('val1');
    expect(ff[0].dataTypeName).toBe(DataTypeName.WholeNumber);
    expect(ff[0].isNullable).toBe(false);
  });

  it('getFieldsInfo numbers check', () => {
    const mapFn = (r: any): any => ({ val1: r });
    const fdFn = (arr: any[]): FieldDescription => getFieldsInfo(arr.map(mapFn))[0];

    expect(fdFn([2, 4, 5]).dataTypeName).toBe(DataTypeName.WholeNumber);
    expect(fdFn([2, 4, 5]).isNullable).toBe(false);
    expect(fdFn([2, 4, null, 5]).dataTypeName).toBe(DataTypeName.WholeNumber);
    expect(fdFn([2, 4, null, 5]).isNullable).toBe(true);
    expect(fdFn([2, 4, null, 5]).isObject).toBe(false);
    expect(fdFn([2, 4.3, 5]).dataTypeName).toBe(DataTypeName.FloatNumber);
    expect(fdFn([2, 4.3, null, 5]).dataTypeName).toBe(DataTypeName.FloatNumber);
    expect(fdFn([2, 2147483699, 5]).dataTypeName).toBe(DataTypeName.BigIntNumber);
    expect(fdFn([2, 2147483699, null, 5]).dataTypeName).toBe(DataTypeName.BigIntNumber);
    expect(fdFn([2, '4', 5]).dataTypeName).toBe(DataTypeName.WholeNumber);
  });

  it('getFieldsInfo DateTime check', () => {
    const mapFn = (r: any): any => ({ val1: r });
    const fdFn = (arr: any[]): FieldDescription => getFieldsInfo(arr.map(mapFn))[0];

    expect(fdFn(['2019-01-01', '2019-01-02']).dataTypeName).toBe(DataTypeName.Date);
    expect(fdFn(['2019-01-01', '2019-01-02']).isNullable).toBe(false);
    expect(fdFn(['2019-01-01', null, '2019-01-02']).dataTypeName).toBe(DataTypeName.Date);
    expect(fdFn(['2019-01-01', null, '2019-01-02']).isNullable).toBe(true);
    expect(fdFn(['2019-01-01', null, '2019-01-02']).isObject).toBe(false);
    expect(fdFn([new Date(2001, 1, 1), new Date()]).dataTypeName).toBe(DataTypeName.DateTime);
    expect(fdFn([new Date(2001, 1, 1), new Date()]).isObject).toBe(false);

    expect(fdFn(['2019-01-01', 'NOT A DATE', '2019-01-02']).dataTypeName).toBe(DataTypeName.String);
    expect(fdFn(['2019-01-01', 76, '2019-01-02']).dataTypeName).toBe(DataTypeName.String);
    expect(fdFn(['2019-01-01', 76, false, '2019-01-02']).dataTypeName).toBe(DataTypeName.String);
    expect(fdFn(['2019-01-01', 76, false, null, '2019-01-02']).dataTypeName).toBe(
      DataTypeName.String
    );
    expect(fdFn([new Date(2001, 1, 1), 'NOT A DATE', new Date()]).dataTypeName).toBe(
      DataTypeName.String
    );
  });

  it('getFieldsInfo size check', () => {
    const mapFn = (r: any): any => ({ val1: r });
    const fdFn = (arr: any[]): FieldDescription => getFieldsInfo(arr.map(mapFn))[0];

    const longestText = 'Longest Text';
    expect(fdFn(['Test1', 'Longer', longestText]).maxSize).toBe(longestText.length);
    expect(fdFn(['Test1', longestText, 'Longer']).maxSize).toBe(longestText.length);
    expect(fdFn(['Test1', longestText, null, 'Longer']).maxSize).toBe(longestText.length);
    expect(fdFn([87, longestText, '2019-01-01']).maxSize).toBe(longestText.length);
    expect(fdFn([87, longestText, '2019-01-01']).dataTypeName).toBe(DataTypeName.String);
  });

  it('check value types array', () => {
    const fields = getFieldsInfo([1, 2, 3]);

    expect(fields.length).toBe(1);
    expect(fields[0].dataTypeName).toBe(DataTypeName.WholeNumber);
    expect(fields[0].fieldName).toBe('_value_');

    expect(getFieldsInfo(['a', 'b'])[0].dataTypeName).toBe(DataTypeName.String);
    expect(getFieldsInfo(['a', 'b']).length).toBe(1);

    expect(getFieldsInfo(['2021-06-02', '2021-06-02']).length).toBe(1);
    expect(getFieldsInfo(['2021-06-02', '2021-06-02'])[0].dataTypeName).toBe(DataTypeName.Date);
  });
});
