import { Selector, Predicate } from '../types';
import { fieldSelector } from '../_internals';
import { sum } from './stats';

/**
 * Groups array items based on elementSelector function
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function groupBy<T>(array: T[], groupByFields: string | string[] | Selector): T[][] {
  if (!Array.isArray(array)) {
    throw Error('An array is not provided');
  }

  if (!array.length) {
    return array as unknown as T[][];
  }

  const groups: { [key: string]: T[] } = {};

  const elementSelector = fieldSelector(groupByFields as Selector<T, string>);

  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const group = elementSelector(item);
    groups[group] = groups[group] || [];
    groups[group].push(item);
  }

  return Object.values(groups);
}

/**
 * Returns a distinct elements from array.
 * Optional parameter *elementSelector* will create new array based on a callback function,
 * then will eliminate dublicates
 * @param array
 * @param elementSelector
 * @returns
 */
export function distinct<T, V = T>(array: T[], elementSelector?: Selector<T, V>): (T | V)[] {
  if (elementSelector) {
    const mapped = array.map(elementSelector);
    return Array.from(new Set(mapped));
  }
  return Array.from(new Set(array));
}
/**
 * Flatten Object or array of objects
 * Object 
 * [{ a: 1, d:{d1: 22, d2: 33} }, { b: 2, d:{d1:221, d2:331} }]
 * will become
 * [{ a: 1, d.d1: 22, d.d2: 33 }, { b: 2, d.d1: 221, d.d2: 331 }]
 * @param data 
 * @returns 
 */

export function unflattenObject(data: unknown): unknown {


  function setProperty(data: Record<string, unknown>, pName: string, value: unknown): void {
    const pNames = pName.split('.')
    let parent: Record<string, unknown> = data

    for (let i = 0; i < pNames.length - 1; i++) {
      if (pNames[i] in parent) {
        parent = parent[pNames[i]] as Record<string, unknown>
      } else {
        parent[pNames[i]] = {}
        parent = parent[pNames[i]] as Record<string, unknown>
      }
    }
    parent[pNames[pNames.length - 1]] = value
  }
  
  if (Array.isArray(data)) {
    const arr = [];
    for (let i = 0; i < data.length; i++) {
      const obj = unflattenObject(data[i]);
      arr.push(obj);
    }
    return arr;
  } else {
    const obj: Record<string, unknown> = {}
    const keys = Object.keys(data as Record<string, unknown>);
    for (let i = 0; i < keys.length; i++) {
      setProperty(obj, keys[i], (data as Record<string, unknown>)[keys[i]])
    }
    return obj
  }
}

export function flattenObject(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== 'object') {
    return data as Record<string, unknown>[];
  }

  function iterate(rootData: Record<string, unknown>, obj: Record<string, unknown>, prefix: string): void {
    const keys = Object.keys(rootData);

    for (let i = 0; i < keys.length; i++) {
      const pName = prefix ? `${prefix}.${keys[i]}` : keys[i];

      const value = rootData[keys[i]];
      if (
        typeof value === 'object' &&
        value !== null &&
        value !== undefined &&
        !(value instanceof Date)
      ) {
        iterate(value as Record<string, unknown>, obj, pName);
      } else if (typeof value === 'function') {
        continue;
      } else {
        obj[pName] = value;
      }
    }
  }

  if (Array.isArray(data)) {
    const arr = [];
    for (let i = 0; i < data.length; i++) {
      const obj = flattenObject(data[i]);
      arr.push(obj);
    }
    return arr as unknown as Record<string, unknown>[];
  } else {
    const obj: Record<string, unknown> = {};

    iterate(data as Record<string, unknown>, obj, '');

    return obj as unknown as Record<string, unknown>[];
  }
}

/**
 * Flattens array.
 * @param array The array to flatten recursively.
 * @example
 * flatten([1, 4, [2, [5, 5, [9, 7]], 11], 0]); // length 9
 */
export function flatten<T>(array: T[]): T[] {
  if (!Array.isArray(array)) {
    throw Error('An array is not provided');
  }

  if (!array.length) {
    return array;
  }

  let res: T[] = [];
  const length = array.length;

  for (let i = 0; i < length; i++) {
    const value = array[i];
    if (Array.isArray(value)) {
      res = [...res, ...flatten(value as T[])];
    } else {
      res.push(value);
    }
  }
  return res;
}

/**
 * Returns a reshaped array based on unique column values.
 * @param array array to pivot
 * @param rowFields row fields (or index fields). It can be one or more field names
 * @param columnField a field which values will be used to create columns
 * @param dataField a dataField which will be aggrated with aggregate function and groupped by rows and columns
 * @param aggFunction an aggregation function. Default value is sum. data field will be aggregated by this function
 * @param columnValues an optional initial column values. Use it to define a set of columns/values you would expect
 */
export function pivot<T extends Record<string, unknown>>(
  array: T[],
  rowFields: string | string[],
  columnField: string,
  dataField: string,
  aggFunction?: (array: unknown[]) => unknown | null,
  columnValues?: string[]
): Array<Record<string, unknown>> {
  if (!Array.isArray(array)) {
    throw Error('An array is not provided');
  }

  if (!array.length) {
    return array;
  }

  const groups: { [key: string]: T[] } = Object.create(null);
  columnValues = columnValues || [];
  aggFunction = aggFunction || ((a: unknown[]): number | null => sum(a as number[]));

  const elementSelector = fieldSelector(rowFields);

  rowFields = Array.isArray(rowFields) ? rowFields : [rowFields];

  // group by rows
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const group = elementSelector(item);
    groups[group] = groups[group] || [];
    groups[group].push(item);

    // accumulate column values
    const columnValue = item[columnField] as string;
    if (columnValues.indexOf(columnValue) < 0) {
      columnValues.push(columnValue);
    }
  }

  const result: Array<Record<string, unknown>> = [];
  for (const groupName of Object.keys(groups)) {
    const item: Record<string, unknown> = Object.create(null);
    // row fields first
    for (const rowField of rowFields) {
      item[rowField] = groups[groupName][0][rowField];
    }

    // then aggregated data for each colum value
    for (const columnValue of columnValues) {
      const dataArray = groups[groupName]
        .filter(r => r[columnField] === columnValue)
        .map(r => r[dataField]);
      item[columnValue] = aggFunction(dataArray);
    }

    result.push(item);
  }

  return result;
}

/**
 * Transpose rows to columns in an array
 * @param data
 */
export function transpose<T extends Record<string, unknown>>(data: T[]): Array<Record<string, unknown>> {
  if (!Array.isArray(data)) {
    throw Error('An array is not provided');
  }

  if (!data.length) {
    return data;
  }

  return Object.keys(data[0]).map(key => {
    const res: Record<string, unknown> = {};
    data.forEach((item, i) => {
      if (i === 0) {
        res.fieldName = key;
      }

      res['row' + i] = item[key];
    });
    return res;
  });
}

/**
 * Creates new array based on selector.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function select<T>(data: T[], selector: string | string[] | Selector<T, string>): string[] {
  if (!Array.isArray(data)) {
    throw Error('An array is not provided');
  }

  if (!data.length) {
    return [];
  }
  const elementSelector = fieldSelector(selector);
  return data.map(elementSelector);
}

/**
 * Filters array based on predicate function.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function where<T>(data: T[], predicate: Predicate<T>): T[] {
  if (!Array.isArray(data)) {
    throw Error('An array is not provided');
  }

  return data.filter(predicate);
}
