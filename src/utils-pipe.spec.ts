import dataUtils from './utils-pipe';

describe('Test dataUtils', () => {
  it('parseDate', () => {
    expect(dataUtils().parseDate('')).toBe(undefined);
    expect(dataUtils().parseDate('10-1010')).toBe(undefined);
    expect(dataUtils().parseDate(null)).toBe(undefined);
    let date = dataUtils().parseDate(1111);
    if (date) {
      expect(date.getFullYear()).toBe(1970);
    }
    date = dataUtils().parseDate('10-10-10');
    expect(date).toBeInstanceOf(Date);
    if (date) {
      expect(date.getMonth()).toBe(9);
    }
  })

  it('parseNumber', () => {
    expect(dataUtils().parseNumber('')).toBe(undefined);
    expect(dataUtils().parseNumber('11')).toBe(11);
    expect(dataUtils().parseNumber('11.1')).toBe(11.1);
    expect(dataUtils().parseNumber(11.1)).toBe(11.1);
    expect(dataUtils().parseNumber(NaN)).toBe(undefined);
  })
})
