import { dataPipe } from '../index';
import { table } from './table.spec';
import { data } from './array.spec';
import { DataPipe } from '../data-pipe';

describe('DataPipe specification', () => {
  it('dataPipe returns DataPipe', () => {
    expect(dataPipe([]) instanceof DataPipe).toBeTruthy();
  });

  it('toArray', () => {
    const arr = dataPipe(['US']).toArray();
    expect(arr instanceof Array).toBeTruthy();
    expect(arr).toEqual(['US']);
  });

  it('select/map', () => {
    const arr = [{ country: 'US' }];
    expect(
      dataPipe(arr)
        .select(i => i.country)
        .toArray()
    ).toEqual(['US']);
    expect(
      dataPipe(arr)
        .map(i => i.country)
        .toArray()
    ).toEqual(['US']);
  });

  it('groupBy', () => {
    const dp = dataPipe(data).groupBy(i => i.country);
    expect(dp.toArray().length).toBe(3);
  });

  it('fromTable/toTable', () => {
    const tData = dataPipe()
      .fromTable(table.rows, table.fields)
      .filter(r => r.country !== 'US')
      .toTable();
    expect(tData.rows.length).toBe(5);
  });

  it('unique', () => {
    const arr = [1, '5', 3, 5, 3, 4, 3, 1];
    expect(dataPipe(arr).unique().toArray().length).toBe(5);
  });
});
