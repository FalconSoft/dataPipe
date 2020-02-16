import { parseDatetimeOrNull, parseNumberOrNull } from "../utils";


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
    expect(parseNumberOrNull(11.1)).toBe(11.1);
    expect(parseNumberOrNull(NaN)).toBe(NaN);
  })
})
