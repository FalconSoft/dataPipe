import { dataPipe } from './index';
import { fromCsv, ParsingOptions } from './dsv-parser';

describe('Dsv Parser specification', () => {
  it('simple numbers', () => {
    const csv = ["F1,F2","1,2"].join('\n')
    const result =  fromCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F1).toBe(1);
    expect(result[0].F2).toBe(2);
  })

  it('simple numders and strings', () => {    
    const csv = ["F1,F2,F3",`1,2,"Test, comma"`].join('\n')
    const result =  fromCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F3).toBe('Test, comma');
  })

  it('Empty should be null', () => {    
    const csv = ["F1,F2,F3",`1,,"Test, comma"`].join('\n')
    const result =  fromCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(null);
  })

  it('Multiline string', () => {
    const multiLineString = `this is , 5 - ,
    multi-line
    string`;
    const csv = ["F1,F2,F3",`1,"${multiLineString}","Test, comma"`].join('\n')
    const result =  fromCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(multiLineString);
  })  

  it('Multiline string DSV', () => {
    const multiLineString = `this is , 5 - ,
    multi-line
    string`;
    const csv = ["F1\tF2\tF3",`1\t"${multiLineString}"\t"Test, comma"`].join('\n')
    const result =  fromCsv(csv, <ParsingOptions>{separator:'\t'});
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(multiLineString);
  })  

  it('DSV with comma numbers', () => {
    const csv = ["F1\tF2\tF3",`1\t1,000.32\t"Test, comma"`].join('\n')
    const result =  fromCsv(csv, <ParsingOptions>{separator:'\t'});
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(1000.32);
  })  

})
