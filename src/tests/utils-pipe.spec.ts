import { parseDatetimeOrNull, parseNumberOrNull, getFieldDescriptions } from "../utils";
import { FieldDescription, DataTypes } from "../types";


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
  })

  it('parseNumber', () => {
    expect(parseNumberOrNull('')).toBe(null);
    expect(parseNumberOrNull('11')).toBe(11);
    expect(parseNumberOrNull('11.1')).toBe(11.1);
    expect(parseNumberOrNull('-11.1')).toBe(-11.1);
    expect(parseNumberOrNull(11.1)).toBe(11.1);
    expect(parseNumberOrNull(NaN)).toBe(NaN);
  })

  it('getFieldDescriptions', () => {
    const arr = [2, 4, 5].map(r => ({ val1: r }));
    const ff = getFieldDescriptions(arr);
    expect(ff.length).toBe(1);
    expect(ff[0].fieldName).toBe('val1');
    expect(ff[0].dataType).toBe(DataTypes.WholeNumber);
    expect(ff[0].isNullable).toBe(false);
  });

  it('getFieldDescriptions2', () => {
    const arr = [2, '4', 5].map(r => ({ val1: r }));
    const ff = getFieldDescriptions(arr);
    expect(ff.length).toBe(1);
    expect(ff[0].fieldName).toBe('val1');
    expect(ff[0].dataType).toBe(DataTypes.String);
    expect(ff[0].isNullable).toBe(false);
  });

  it('getFieldDescriptions numbers check', () => {
    const mapFn = (r: any): any => ({ val1: r });
    const fdFn = (arr: any[]): FieldDescription => getFieldDescriptions(arr.map(mapFn))[0];

    expect(fdFn([2, 4, 5]).dataType).toBe(DataTypes.WholeNumber);
    expect(fdFn([2, 4, 5]).isNullable).toBe(false);
    expect(fdFn([2, 4, null, 5]).dataType).toBe(DataTypes.WholeNumber);
    expect(fdFn([2, 4, null, 5]).isNullable).toBe(true);
    expect(fdFn([2, 4.3, 5]).dataType).toBe(DataTypes.FloatNumber);
    expect(fdFn([2, 4.3, null, 5]).dataType).toBe(DataTypes.FloatNumber);
    expect(fdFn([2, 2147483699, 5]).dataType).toBe(DataTypes.BigIntNumber);
    expect(fdFn([2, 2147483699, null, 5]).dataType).toBe(DataTypes.BigIntNumber);
    expect(fdFn([2, '4', 5]).dataType).toBe(DataTypes.String);
  });

  it('getFieldDescriptions DateTime check', () => {
    const mapFn = (r: any): any => ({ val1: r });
    const fdFn = (arr: any[]): FieldDescription => getFieldDescriptions(arr.map(mapFn))[0];

    expect(fdFn(['2019-01-01', '2019-01-02']).dataType).toBe(DataTypes.DateTime);
    expect(fdFn(['2019-01-01', '2019-01-02']).isNullable).toBe(false);
    expect(fdFn(['2019-01-01', null, '2019-01-02']).dataType).toBe(DataTypes.DateTime);
    expect(fdFn(['2019-01-01', null, '2019-01-02']).isNullable).toBe(true);
    expect(fdFn([new Date(2001, 1, 1), new Date()]).dataType).toBe(DataTypes.DateTime);

    expect(fdFn(['2019-01-01','NOT A DATE', '2019-01-02']).dataType).toBe(DataTypes.String);
    expect(fdFn(['2019-01-01', 76, '2019-01-02']).dataType).toBe(DataTypes.String);
    expect(fdFn(['2019-01-01', 76, false, '2019-01-02']).dataType).toBe(DataTypes.String);
    expect(fdFn(['2019-01-01', 76, false, null, '2019-01-02']).dataType).toBe(DataTypes.String);
    expect(fdFn([new Date(2001, 1, 1), 'NOT A DATE', new Date()]).dataType).toBe(DataTypes.String);
  });

  it('getFieldDescriptions size check', () => {
    const mapFn = (r: any): any => ({ val1: r });
    const fdFn = (arr: any[]): FieldDescription => getFieldDescriptions(arr.map(mapFn))[0];

    const longestText = 'Longest Text';
    expect(fdFn(['Test1', 'Longer', longestText]).maxSize).toBe(longestText.length);
    expect(fdFn(['Test1', longestText, 'Longer']).maxSize).toBe(longestText.length);
    expect(fdFn(['Test1', longestText, null, 'Longer']).maxSize).toBe(longestText.length);
    expect(fdFn([87, longestText, '2019-01-01']).maxSize).toBe(longestText.length);
    expect(fdFn([87, longestText, '2019-01-01']).dataType).toBe(DataTypes.String);
  });


})

