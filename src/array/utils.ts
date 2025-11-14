import { parseNumber, parseDatetimeOrNull } from '../utils';
import { ScalarType, Selector } from '..';
import { fieldSelector } from '../_internals';

function compareStrings(a: string, b: unknown): number {
  return a.localeCompare(String(b));
}

function compareNumbers(a: number, b: unknown): number {
  const bNumVal = parseNumber(b as ScalarType);
  if (bNumVal === undefined) {
    return 1;
  }

  return a - bNumVal;
}

function compareObjects(a: unknown, b: unknown): number {
  const aDate = parseDatetimeOrNull(a as string);
  const bDate = parseDatetimeOrNull(b as string);

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

function compare(a: Record<string, unknown>, b: Record<string, unknown>, { field, asc }: { field: string; asc: boolean }): number {
  const valA = a[field];
  const valB = b[field];
  const order = asc ? 1 : -1;

  if (valA !== undefined && valB === undefined) {
    return order;
  }

  switch (typeof valA) {
    case 'number':
      return order * compareNumbers(valA, valB);
    case 'string':
      return order * compareStrings(valA, valB);
    case 'object':
      return order * compareObjects(valA, valB);
    case 'undefined':
      return valB === undefined ? 0 : -1 * order;
  }
  return 0;
}

function comparator(sortFields: Array<{ field: string; asc: boolean }>): (a: Record<string, unknown>, b: Record<string, unknown>) => number {
  if (sortFields.length) {
    return (a: Record<string, unknown>, b: Record<string, unknown>): number => {
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
export function isArrayEmptyOrNull(array: unknown[]): boolean {
  return !array || !Array.isArray(array) || !array.length;
}

/**
 * A simple sort array function with a convenient interface
 * @param array The array to process.
 * @param fields sorts order.
 * @public
 * @example
 * sort(array, 'name ASC', 'age DESC');
 */
export function sort<T = Record<string, unknown>>(array: T[], ...fields: string[]): T[] {
  if (!array || !Array.isArray(array)) {
    throw Error('Array is not provided');
  }

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

  array.sort(comparator(sortFields) as (a: T, b: T) => number);
  return array;
}
/**
 * Converts array of items to the object map. Where key selector can be defined.
 * @param array to be converted
 * @param keyField a selector or field name for a property name
 */
export function toObject<T = unknown>(
  array: T[],
  keyField: string | string[] | Selector<T, string>
): Record<string, T> {
  const result = {} as Record<string, T>;

  for (const item of array) {
    const key = fieldSelector(keyField)(item);
    result[key] = item;
  }

  return result;
}

/**
 * Convert array of items to into series array or series record.
 * @param array Array to be converted
 * @param propertyName optional parameter to define a property to be unpacked.
 * If it is string the array with values will be returned, otherwise an object with a list of series map
 */
export function toSeries(
  array: Array<Record<string, unknown>>,
  propertyName?: string | string[]
): Record<string, ScalarType[]> | ScalarType[] {
  if (!array?.length) {
    return {};
  }

  // a single property
  if (typeof propertyName == 'string') {
    return array.map(r => (r[propertyName] === undefined ? null : (r[propertyName] as ScalarType)));
  }

  const seriesRecord: Record<string, ScalarType[]> = {};

  const seriesNames =
    Array.isArray(propertyName) && propertyName.length ? propertyName : Object.keys(array[0]);

  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < seriesNames.length; j++) {
      const seriesName = seriesNames[j];
      if (!seriesRecord[seriesName]) {
        seriesRecord[seriesName] = [];
      }
      const value = array[i][seriesName];
      seriesRecord[seriesName].push(value === undefined ? null : (value as ScalarType));
    }
  }

  return seriesRecord;
}
