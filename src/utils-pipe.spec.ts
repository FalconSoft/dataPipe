import { utils } from './utils-pipe';

describe('Test dataUtils', () => {
  it('parseDate', () => {
    expect(utils().parseDate('')).toBe(null);
    expect(utils().parseDate('10-1010')).toBe(null);
    expect(utils().parseDate(null)).toBe(null);
    let date = utils().parseDate(1111);
    if (date) {
      expect(date.getFullYear()).toBe(1970);
    }
    date = utils().parseDate('10-10-10');
    expect(date).toBeInstanceOf(Date);
    if (date) {
      expect(date.getMonth()).toBe(9);
    }
  })

  it('parseNumber', () => {
    expect(utils().parseNumber('')).toBe(null);
    expect(utils().parseNumber('11')).toBe(11);
    expect(utils().parseNumber('11.1')).toBe(11.1);
    expect(utils().parseNumber(11.1)).toBe(11.1);
    expect(utils().parseNumber(NaN)).toBe(NaN);
  })
})
