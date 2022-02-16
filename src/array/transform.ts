import { Selector, Predicate } from "../types";
import { fieldSelector } from "../_internals";
import { sum } from "./stats";

/**
 * Groups array items based on elementSelector function
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function groupBy(
  array: any[],
  groupByFields: string | string[] | Selector
): any[] {
  if (!Array.isArray(array)) {
    throw Error("An array is not provided");
  }

  if (!array.length) {
    return array;
  }

  const groups: { [key: string]: any[] } = {};

  const elementSelector = fieldSelector(groupByFields);

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
export function distinct(array: any[], elementSelector?: Selector): any[] {
  if (elementSelector) {
    array = array.map(elementSelector);
  }
  return Array.from(new Set(array));
}

/**
 * Flattens array.
 * @param array The array to flatten recursively.
 * @example
 * flatten([1, 4, [2, [5, 5, [9, 7]], 11], 0]); // length 9
 */
export function flatten(array: any[]): any[] {
  if (!Array.isArray(array)) {
    throw Error("An array is not provided");
  }

  if (!array.length) {
    return array;
  }

  let res: any = [];
  const length = array.length;

  for (let i = 0; i < length; i++) {
    const value = array[i];
    if (Array.isArray(value)) {
      res = [...res, ...flatten(value)];
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
export function pivot(
  array: any,
  rowFields: string | string[],
  columnField: string,
  dataField: string,
  aggFunction?: (array: any[]) => any | null,
  columnValues?: string[]
): any[] {
  if (!Array.isArray(array)) {
    throw Error("An array is not provided");
  }

  if (!array.length) {
    return array;
  }

  const groups: { [key: string]: any[] } = Object.create(null);
  columnValues = columnValues || [];
  aggFunction = aggFunction || ((a: any[]): number | null => sum(a));

  const elementSelector = fieldSelector(rowFields);

  rowFields = Array.isArray(rowFields) ? rowFields : [rowFields];

  // group by rows
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const group = elementSelector(item);
    groups[group] = groups[group] || [];
    groups[group].push(item);

    // accumulate column values
    const columnValue = item[columnField];
    if (columnValues.indexOf(columnValue) < 0) {
      columnValues.push(columnValue);
    }
  }

  const result: any[] = [];
  for (const groupName of Object.keys(groups)) {
    const item = Object.create(null);
    // row fields first
    for (const rowField of rowFields) {
      item[rowField] = groups[groupName][0][rowField];
    }

    // then aggregated data for each colum value
    for (const columnValue of columnValues) {
      const dataArray = groups[groupName]
        .filter((r) => r[columnField] === columnValue)
        .map((r) => r[dataField]);
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
export function transpose(data: any[]): any[] {
  if (!Array.isArray(data)) {
    throw Error("An array is not provided");
  }

  if (!data.length) {
    return data;
  }

  return Object.keys(data[0]).map((key) => {
    const res: { [key: string]: any } = {};
    data.forEach((item, i) => {
      if (i === 0) {
        res.fieldName = key;
      }

      res["row" + i] = item[key];
    });
    return res;
  });
}

/**
 * Creates new array based on selector.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function select(
  data: any[],
  selector: string | string[] | Selector
): any[] {
  if (!Array.isArray(data)) {
    throw Error("An array is not provided");
  }

  if (!data.length) {
    return data;
  }
  const elementSelector = fieldSelector(selector);
  return data.map(elementSelector);
}

/**
 * Filters array based on predicate function.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function where(data: any[], predicate: Predicate): any[] {
  if (!Array.isArray(data)) {
    throw Error("An array is not provided");
  }

  return data.filter(predicate);
}
