
import { data } from "./array.spec";
import { fromTable, toTable } from "../utils";

export const table = {
  fields: ['name', 'country'],
  rows: [
    [ 'John', 'US' ],
    [ 'Joe', 'US' ],
    [ 'Bill', 'US' ],
    [ 'Adam', 'UK' ],
    [ 'Scott', 'UK' ],
    [ 'Diana', 'UK' ],
    [ 'Marry', 'FR' ],
    [ 'Luc', 'FR' ]
  ]
}

describe('Test table methods', () => {
  it('fromTable', () => {
    const list = fromTable(table.rows, table.fields);
    expect(list[0]).toHaveProperty('name');
    expect(list[0]).toHaveProperty('country');
    expect(list.length).toBe(table.rows.length);
  })

  it('toTable', () => {
    const tableData = toTable(data);
    expect(tableData).toHaveProperty('rows');
    expect(tableData).toHaveProperty('fields');
    expect(tableData.rows.length).toBe(data.length);
    expect(tableData.fields[0]).toBe('name');
    expect(tableData.fields[1]).toBe('country');

    const tableData2 = toTable(data, 'values', 'fieldNames');
    expect(tableData2).toHaveProperty('values');
    expect(tableData2).toHaveProperty('fieldNames');
  })
});
