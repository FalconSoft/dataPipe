import { dataPipe } from './index';
import { fromCsv, ParsingOptions } from './dsv-parser';

describe('Dsv Parser specification', () => {
  it('simple numbers', () => {
    const csv = ["F1,F2", "1,2"].join('\n')
    const result = fromCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F1).toBe(1);
    expect(result[0].F2).toBe(2);
  })

  it('simple numders and strings', () => {
    const csv = ["F1,F2,F3", `1,2,"Test, comma"`].join('\n')
    const result = fromCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F3).toBe('Test, comma');
  })

  it('Empty should be null', () => {
    const csv = ["F1,F2,F3", `1,,"Test, comma"`].join('\n')
    const result = fromCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(null);
  })

  it('Multiline string', () => {
    const multiLineString = `this is , 5 - ,
    multi-line
    string`;
    const csv = ["F1,F2,F3", `1,"${multiLineString}","Test, comma"`].join('\n')
    const result = fromCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(multiLineString);
  })

  it('Multiline string DSV', () => {
    const multiLineString = `this is , 5 - ,
    multi-line
    string`;
    const csv = ["F1\tF2\tF3", `1\t"${multiLineString}"\t"Test, comma"`].join('\n')
    const result = fromCsv(csv, <ParsingOptions>{ separator: '\t' });
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(multiLineString);
  })

  it('DSV with comma numbers', () => {
    const csv = ["F1\tF2\tF3", `1\t1,000.32\t"Test, comma"`].join('\n')
    const result = fromCsv(csv, <ParsingOptions>{ separator: '\t' });
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(1000.32);
  })

  it('skip rows', () => {
    const csv = ["", "", "F1\tF2\tF3", `1\t1,000.32\t"Test, comma"`].join('\n')
    const result = fromCsv(csv, <ParsingOptions>{ separator: '\t', skipRows: 2 });
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(1000.32);
  })
  it('skip rows not empty rows', () => {
    const csv = ["", " * not Empty *", "F1\tF2\tF3", `1\t1,000.32\t"Test, comma"`].join('\n')
    const result = fromCsv(csv, <ParsingOptions>{ separator: '\t', skipRows: 2 });
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(1000.32);
  })

  it('skipUntil', () => {
    const csv = ["", " * not Empty *", "F1\tF2\tF3", `1\t1,000.32\t"Test, comma"`].join('\n')
    var options = new ParsingOptions();
    options.separator = '\t';
    options.skipUntil = t => t && t.length > 1;

    const result = fromCsv(csv, options);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(1000.32);
  })

  it('empty values', () => {
    const csv = ["", "",, "\t\t\t", "F1\tF2\tF3", `1\t1,000.32\t"Test, comma"`, "\t\t"].join('\n')
    var options = new ParsingOptions();
    options.separator = '\t';
    
    const result = fromCsv(csv, options);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(1000.32);
  })

  it('Date Fields', () => {
    const csv = ["F1\tF2\tF3", `2020-02-11\t1,000.32\t"Test, comma"`].join('\n')
    var options = new ParsingOptions();
    options.separator = '\t';
    options.dateFields = ['F1']
    
    const result = fromCsv(csv, options);
    expect(result.length).toBe(1);
    expect(result[0].F1 instanceof Date).toBe(true);
  })


})
