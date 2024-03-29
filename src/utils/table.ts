import { ScalarObject, PrimitiveType, TableDto, DataTypeName } from '../types';
import { parseDatetimeOrNull, dateToString } from './helpers';

/**
 * Get JSON type array for tabel type array.
 * @param rowsOrTable Table data or Array of values .
 * @param fieldNames Column names. If not provided then, it will be auto generated
 * @param fieldDataTypes Column names
 */
export function fromTable(
  rowsOrTable: PrimitiveType[][] | TableDto,
  fieldNames?: string[],
  fieldDataTypes?: DataTypeName[]
): ScalarObject[] {
  const table = rowsOrTable as TableDto;
  const rows = table?.rows || rowsOrTable || [];

  if (!rows.length) {
    // return empty array
    return [];
  }

  fieldNames = table?.fieldNames || fieldNames || rows[0].map((v, i) => `Field${i}`);
  fieldDataTypes = table?.fieldDataTypes || fieldDataTypes || [];

  const values: ScalarObject[] = [];
  for (const row of rows) {
    const value: ScalarObject = {};
    for (let i = 0, len = fieldNames.length; i < len; i++) {
      const fieldName = fieldNames[i];
      const dataType = fieldDataTypes.length ? fieldDataTypes[i] : null;
      value[fieldName] =
        (dataType === DataTypeName.DateTime || dataType === DataTypeName.Date) && row[i]
          ? parseDatetimeOrNull(row[i] as string | Date)
          : row[i];
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
export function toTable(values: ScalarObject[]): TableDto {
  const tableDto: TableDto = {
    fieldNames: [],
    rows: []
  };

  if (!values?.length) {
    return tableDto;
  }

  const fN = new Set<string>();
  values.forEach(v => {
    Object.keys(v).forEach(k => fN.add(k));
  });

  tableDto.fieldNames = Array.from(fN.values());
  tableDto.rows = values.map(rowValues => {
    return tableDto.fieldNames.reduce((r, field) => {
      const v = rowValues[field];
      const val = v instanceof Date ? dateToString(v) : v;
      r.push(val as PrimitiveType);
      return r;
    }, [] as PrimitiveType[]);
  });
  return tableDto;
}
