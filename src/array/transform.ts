import { Selector } from "../types";
import { fieldSelector } from "../_internals";
import { avg, sum } from "./stats";

/**
 * Groups array items based on elementSelector function
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function groupBy(array: any[], groupByFields: string | string[] | Selector): any[] {
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
 * Flattens array.
 * @param array The array to flatten recursively.
 * @example
 * flatten([1, 4, [2, [5, 5, [9, 7]], 11], 0]); // length 9
 */
export function flatten(array: any[]): any[] {
    let res: any = [];
    const length = array.length;

    for (let i = 0; i < length; i++) {
        var value = array[i];
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
export function pivot(array: any, rowFields: string | string[],columnField: string, dataField: string,
    aggFunction?: (array: any[]) => any | null, columnValues?: string[]): any[] {

    const groups: { [key: string]: any[] } = Object.create(null);
    columnValues = columnValues || [];
    aggFunction = aggFunction || ((a: any[]) => sum(a));

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

    var result: any[] = [];
    for (const groupName of Object.keys(groups)) {

        const item = Object.create(null);
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
 * Transpose Array. Row to columns
 * @param data 
 */
export function transpose(data: any[]): any[] | null {
    if (!data) {
      return null;
    }
  
    return Object.keys(data[0]).map(key => {
      const res: { [key: string]: any } = {};
      data.forEach((item, i) => {
        if (i === 0) {
          res.fieldName = key;
        }
  
        res['row' + i] = item[key];
      });
      return res;
    });
  }
  