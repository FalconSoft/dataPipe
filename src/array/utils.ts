import { parseNumber, parseDatetimeOrNull, dateToString } from "../utils";
import { Selector } from "..";
import { fieldSelector } from "../_internals";

function compareStrings(a: string, b: any): number {
  return a.localeCompare(b);
}

function compareNumbers(a: number, b: any): number {
  const bNumVal = parseNumber(b);
  if (bNumVal === undefined) {
    return 1;
  }

  return a - bNumVal;
}

function compareObjects(a: any, b: any): number {
  const aDate = parseDatetimeOrNull(a);
  const bDate = parseDatetimeOrNull(b);

  if (!aDate && !bDate) {
    return 0;
  }

  if (!aDate) {
    return -1;
  }

  if (!bDate) {
    return 1;
  }

  return aDate.getTime() - bDate.getTime();
}

function compare(a: any, b: any, { field, asc }: any): number {
  const valA = a[field];
  const valB = b[field];
  const order = asc ? 1 : -1;

  if (valA !== undefined && valB === undefined) {
    return order;
  }

  switch (typeof valA) {
    case 'number': return order * compareNumbers(valA, valB);
    case 'string': return order * compareStrings(valA, valB);
    case 'object': return order * compareObjects(valA, valB);
    case 'undefined': return valB === undefined ? 0 : (-1 * order);
  }
  return 0;
}

function comparator(sortFields: any[]): (a: any, b: any) => number {
  if (sortFields.length) {
    return (a: any, b: any): number => {
      for (let i = 0, len = sortFields.length; i < len; i++) {
        const res = compare(a, b, sortFields[i]);

        if (res !== 0) {
          return res;
        }
      }
      return 0;
    };
  }

  return (): number => 0;
}

/**
 * Checks if array is empty or null or array at all
 * @param array
 */
export function isArrayEmptyOrNull(array: any[]): boolean {
  return !array || !Array.isArray(array) || !array.length;
}

/**
 * Sorts array.
 * @param array The array to process.
 * @param fields sorts order.
 * @public
 * @example
 * sort(array, 'name ASC', 'age DESC');
 */
export function sort(array: any[], ...fields: string[]): any[] {

  if (!array || !Array.isArray(array)) { throw Error('Array is not provided'); }

  if (!fields?.length) {
    // just a default sort
    return array.sort();
  }

  const sortFields = fields.map(field => {
    const asc = !field.endsWith(' DESC');
    return {
      asc,
      field: field.replace(asc ? /\sASC$/ : /\sDESC$/, '')
    };
  });

  array.sort(comparator(sortFields));
  return array;
}

export function toObject(array: any[], keyField: string | string[] | Selector<any, string>): Record<string, any> {
  const result = {} as Record<string, any>;

  for (const item of array) {
    let key = fieldSelector(keyField)(item);
    if (key as any instanceof Date) {
      key = dateToString(key as any)
    }
    result[key] = item
  }

  return result;
}

