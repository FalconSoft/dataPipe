import dataPipe from './index';
import { DataPipe } from './data-pipe';

describe('DataPipe specification', () => {

  const data = [
    { name: "John", country: "US" }, { name: "Joe", country: "US" }, { name: "Bill", country: "US" }, { name: "Adam", country: "UK" },
    { name: "Scott", country: "UK" }, { name: "Diana", country: "UK" }, { name: "Marry", country: "FR" }, { name: "Luc", country: "FR" }
  ]

  it('dataPipe returns DataPipe', () => {
    expect(dataPipe([]) instanceof DataPipe).toBeTruthy();
  });

  it('toArray', () => {
    const arr = dataPipe(['US']).toArray();
    expect(arr instanceof Array).toBeTruthy();
    expect(arr).toEqual(['US']);
  })

  it('select/map', () => {
    const arr = [{ country: 'US' }];
    expect(dataPipe(arr).select(i => i.country).toArray()).toEqual(['US']);
    expect(dataPipe(arr).map(i => i.country).toArray()).toEqual(['US']);
  })

  it('groupBy', () => {
    const dp = dataPipe(data).groupBy(i => i.country)
    expect(dp.toArray().length).toBe(3);
  })
})
