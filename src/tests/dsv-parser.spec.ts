import { parseCsv, toCsv, parseCsvToTable } from '../utils';
import { ParsingOptions, DataTypeName } from '../types';

describe('Dsv Parser specification', () => {
  it('simple numbers', () => {
    const csv = ["F1,F2", "1,2"].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F1).toBe(1);
    expect(result[0].F2).toBe(2);
  })

  it('simple numbers (double)', () => {
    const csv = ["F1,F2", "1,2.5"].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F1).toBe(1);
    expect(result[0].F2).toBe(2.5);
  })

  it('simple numbers (double) with thousand', () => {
    const csv = ["F1,F2", `1,"2,000.5"`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F1).toBe(1);
    expect(result[0].F2).toBe(2000.5);
  })

  it('simple numbers (double) negative', () => {
    const csv = ["F1,F2", `1,-2000.5`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F1).toBe(1);
    expect(result[0].F2).toBe(-2000.5);
  })

  it('simple numbers (double) with thousand', () => {
    const csv = ["F1,F2", `1,"-2,000.5"`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F1).toBe(1);
    expect(result[0].F2).toBe(-2000.5);
  })

  it('simple numders and strings', () => {
    const csv = ["F1,F2,F3", `1,2,"Test, comma"`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F3).toBe('Test, comma');
  })

  it('String with quotes 1', () => {
    const csv = ["F1,F2", `1,"T ""k"" c"`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe('T "k" c');
  })

  it('String with quotes 2', () => {
    const csv = ["F1,F2,F3", `1,"T ""k"" c",77`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe('T "k" c');
    expect(result[0].F3).toBe(77);
  })

  it('String with quotes 3', () => {
    const csv = ["F1,F2,F3", `1,"T """,77`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe('T "');
    expect(result[0].F3).toBe(77);
  })

  it('String with quotes 4', () => {
    const csv = ["F1,F2", `1,"T """`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe('T "');
  })

  it('String with quotes 5 empty " " ', () => {
    const csv = ["F1,F2", `1," "`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(' ');
  })

  it('String with quotes 6 empty " " ', () => {
    const csv = ["F1,F2", `1," "`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(' ');
  })

  it('String with quotes 7 empty "" ', () => {
    const csv = ["F1,F2", `1,"dd"`, `1,""`].join('\n')
    const result = parseCsv(csv);
    expect(result[1].F2).toBe('');
  })

  it('simple numders and strings with spaces', () => {
    const csv = ["F1,F2 ,F3", `1,2,"Test, comma"`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(2);
  })

  it('simple numders and zeros', () => {
    const csv = ["F1,F2,F3", `0,2,0`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F1).toBe(0);
    expect(result[0].F2).toBe(2);
    expect(result[0].F3).toBe(0);
  })

  it('Empty should be null', () => {
    const csv = ["F1,F2,F3", `1,,"Test, comma"`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(null);
  })

  it('Multiline string', () => {
    const multiLineString = `this is , 5 - ,
    multi-line
    string`;
    const csv = ["F1,F2,F3", `1,"${multiLineString}","Test, comma"`].join('\n')
    const result = parseCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(multiLineString);
  })

  it('Multiline string DSV', () => {
    const multiLineString = `this is , 5 - ,
    multi-line
    string`;
    const csv = ["F1\tF2\tF3", `1\t"${multiLineString}"\t"Test, comma"`].join('\n')
    const result = parseCsv(csv, { delimiter: '\t' } as ParsingOptions);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(multiLineString);
  })

  it('DSV with comma numbers', () => {
    const csv = ["F1\tF2\tF3", `1\t1,000.32\t"Test, comma"`].join('\n')
    const result = parseCsv(csv, { delimiter: '\t' } as ParsingOptions);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(1000.32);
  })

  it('skip rows', () => {
    const csv = ["", "", "F1\tF2\tF3", `1\t1,000.32\t"Test, comma"`].join('\n')
    const result = parseCsv(csv, { delimiter: '\t', skipRows: 2 } as ParsingOptions);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(1000.32);
  })

  it('skip rows not empty rows', () => {
    const csv = ["", " * not Empty *", "F1\tF2\tF3", `1\t1,000.32\t"Test, comma"`].join('\n')
    const result = parseCsv(csv, { delimiter: '\t', skipRows: 2 } as ParsingOptions);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(1000.32);
  })

  it('skipUntil', () => {
    const csv = ["", " * not Empty *", "F1\tF2\tF3", `1\t1,000.32\t"Test, comma"`].join('\n')
    const options = new ParsingOptions();
    options.delimiter = '\t';
    options.skipUntil = (t: string[]): boolean => t && t.length > 1;

    const result = parseCsv(csv, options);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(1000.32);
  })

  it('empty values', () => {
    const csv = ["", "", "\t\t\t", "F1\tF2\tF3", `1\t1,000.32\t"Test, comma"`, "\t\t"].join('\n')
    const options = new ParsingOptions();
    options.delimiter = '\t';

    const result = parseCsv(csv, options);
    expect(result.length).toBe(1);
    expect(result[0].F2).toBe(1000.32);
  })

  it('Date Fields', () => {
    const csv = ["F1\tF2\tF3", `2020-02-11\t1,000.32\t"Test, comma"`].join('\n')
    const options = new ParsingOptions();
    options.delimiter = '\t';
    options.dateFields = ['F1']

    const result = parseCsv(csv, options);
    expect(result.length).toBe(1);
    expect(result[0].F1 instanceof Date).toBe(true);
  });

  it('Still string. Because second row is not a number or date', () => {
    const csv = ["F1\tF2\tF3", `2020-02-11\t1,000.32\t"Test, comma"`, "nn\tnn\tnn"].join('\n')
    const options = new ParsingOptions();
    options.delimiter = '\t';

    const result = parseCsv(csv, options);
    expect(result.length).toBe(2);
    expect(typeof result[0].F1 === "string").toBe(true);
    expect(typeof result[0].F2 === "string").toBe(true);
    expect(result[0].F2).toBe('1,000.32');
  });

  it('ToCsv', () => {
    const csv = ["F1,F2,F3", `2020-02-11,1,tt`].join('\n')
    const result = toCsv(parseCsv(csv));
    expect(result).toBe(csv);
  });

});

describe ('Parse Csv To Table', () => {

  it('simple numbers', () => {
    const csv = ["F1,F2", "1,2"].join('\n')
    const result = parseCsvToTable(csv);
    expect(result.rows.length).toBe(1);
    expect(result.fieldDescriptions.length).toBe(2);
    expect(result.fieldDescriptions[0].fieldName).toBe("F1");
    expect(result.fieldDescriptions[0].dataTypeName).toBe(DataTypeName.WholeNumber);
    expect(result.fieldDescriptions[0].isUnique).toBe(true);
    expect(result.fieldDescriptions[0].isNullable).toBe(false);
    // everything returns as a string
    expect(result.rows[0][result.fieldDescriptions[0].index]).toBe('1');
  });

  it('double and non unique', () => {
    const csv = ["F1,F2", "1,2", "1.3,2"].join('\n')
    const result = parseCsvToTable(csv);
    expect(result.rows.length).toBe(2);
    expect(result.fieldDescriptions.length).toBe(2);
    expect(result.fieldDescriptions[0].fieldName).toBe("F1");
    expect(result.fieldDescriptions[0].dataTypeName).toBe(DataTypeName.FloatNumber);
    expect(result.fieldDescriptions[0].isUnique).toBe(true);
    expect(result.fieldDescriptions[1].isUnique).toBe(false);
    expect(result.fieldDescriptions[0].isNullable).toBe(false);
    // everything returns as a string
    expect(result.rows[0][result.fieldDescriptions[0].index]).toBe('1');
  });

  it('boolean test', () => {
    const csv = ["F1,F2", "true,2", "TRUE,2"].join('\n')
    const result = parseCsvToTable(csv);
    expect(result.rows.length).toBe(2);
    expect(result.fieldDescriptions.length).toBe(2);
    expect(result.fieldDescriptions[0].fieldName).toBe("F1");
    expect(result.fieldDescriptions[0].dataTypeName).toBe(DataTypeName.Boolean);
    expect(result.fieldDescriptions[0].isUnique).toBe(true);
    expect(result.fieldDescriptions[1].isUnique).toBe(false);
    expect(result.fieldDescriptions[0].isNullable).toBe(false);
    // everything returns as a string
    expect(result.rows[0][result.fieldDescriptions[0].index]).toBe('true');
    expect(result.rows[1][result.fieldDescriptions[0].index]).toBe('TRUE');
  });

  it('nullable boolean test', () => {
    const csv = ["F1,F2", "true,2", ",2"].join('\n')
    const result = parseCsvToTable(csv);
    expect(result.rows.length).toBe(2);
    expect(result.fieldDescriptions[0].isNullable).toBe(true);
    expect(result.rows[0][result.fieldDescriptions[0].index]).toBe('true');
    expect(result.rows[1][result.fieldDescriptions[0].index]).toBe(null);
  });

  it('nullable date test', () => {
    const csv = ["F1,F2", "2020-02-02,2", ",2"].join('\n')
    const result = parseCsvToTable(csv);
    expect(result.rows.length).toBe(2);
    expect(result.fieldDescriptions[0].isNullable).toBe(true);
    expect(result.fieldDescriptions[0].dataTypeName).toBe(DataTypeName.DateTime);

    expect(result.rows[0][result.fieldDescriptions[0].index]).toBe('2020-02-02');
    expect(result.rows[1][result.fieldDescriptions[0].index]).toBe(null);
  });

  it('nullable date test 2', () => {
    const csv = ["F1,F2", ",2", "2020-02-02,2"].join('\n')
    const result = parseCsvToTable(csv);
    expect(result.rows.length).toBe(2);
    expect(result.fieldDescriptions[0].isNullable).toBe(true);
    expect(result.fieldDescriptions[0].dataTypeName).toBe(DataTypeName.DateTime);

    expect(result.rows[1][result.fieldDescriptions[0].index]).toBe('2020-02-02');
    expect(result.rows[0][result.fieldDescriptions[0].index]).toBe(null);
  });  

  it('nullable float test', () => {
    const csv = ["F1,F2", ",2", ",-2020.98"].join('\n')
    const result = parseCsvToTable(csv);
    expect(result.rows.length).toBe(2);
    expect(result.fieldDescriptions[0].isNullable).toBe(true);
    expect(result.fieldDescriptions[0].dataTypeName || null).toBe(null);
    expect(result.fieldDescriptions[1].dataTypeName).toBe(DataTypeName.FloatNumber);

    expect(result.rows[1][result.fieldDescriptions[1].index]).toBe('-2020.98');
    expect(result.rows[0][result.fieldDescriptions[0].index]).toBe(null);
  });  

});
