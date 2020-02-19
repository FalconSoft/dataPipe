import { parseNumber, parseDatetimeOrNull } from "../utils";

/**
 * Sorts array.
 * @param array The array to process.
 * @param fields sorts order.
 * @public
 * @example
 * sort(array, 'name ASC', 'age DESC');
 */
export function sort(array: any[], ...fields: string[]) {
  const sortFields = fields.map(field => {
    const asc = !field.endsWith(' DESC');
    return {
      asc,
      field: field.replace(asc ? /\sASC$/ : /\sDESC$/, '')
    }
  });

  array.sort(comparator(sortFields));
  return array;
}

function comparator(sortFields: any[]) {
  if (sortFields.length) {
    return (a: any, b: any) => {
      for(let i = 0, len = sortFields.length; i < len; i++) {
        const res = compare(a, b, sortFields[i]);

        if (res !== 0) {
          return res;
        }
      }
      return 0;
    }
  }
}

function compare(a: any, b: any, {field, asc}: any): number {
  const valA = a[field];
  const valB = b[field];
  const order = asc ? 1 : -1;

  switch (typeof valA) {
    case 'number': return order * compareNumbers(valA, valB);
    case 'string': return order * compareStrings(valA, valB);
    case 'object': return order * compareObjects(valA, valB);
    case 'undefined': return -1 * order;
  }
  return 0;
}

function compareStrings(a: string, b: any): number {
  return a.localeCompare(b);
}

function compareNumbers(a: number, b: any): number {
  const bNumVal = parseNumber(b);
  if (bNumVal == undefined) {
    return 1;
  }

  return a - bNumVal;
}

function compareObjects(a: any, b: any) {
  const aDate = parseDatetimeOrNull(a);
  if (!aDate) {
    return -1
  }
  const bDate = parseDatetimeOrNull(b);
  if (!bDate) {
    return 1
  }
  if (a instanceof Date) {
    return a.getTime() - bDate.getTime();
  }

  return -1;
}
