/**
 * Get JSON type array for tabel type array.
 * @param rows Table data. Array of values array.
 * @param fieldNames Column names
 */
export function fromTable(rows: Array<any[]>, fieldNames: string[]): object[] {
  const values = [];
  for (const row of rows || []) {
    const value: {[key: string]: any} = {};
    for (let i = 0, len = fieldNames.length; i < len; i++) {
      value[fieldNames[i]] = row[i];
    }
    values.push(value);
  }
  return values;
}

/**
 * Gets table data from JSON type array.
 * @param array
 * @param rowsFieldName
 * @param fieldsFieldName
 */
export function toTable(array: any[], rowsFieldName = 'rows', fieldsFieldName = 'fields'): {[key: string]: any} {
  if (!array.length) {
    return {
      [fieldsFieldName]: [],
      [rowsFieldName]: []
    };
  }
  return {
    [fieldsFieldName]: Object.keys(array[0]),
    [rowsFieldName]: array.map(rowValues => Object.values(rowValues))

  };
}
