import { Selector, Predicate } from '../types';
import { parseNumber } from '../utils';
import { isArrayEmptyOrNull } from './utils';

function fieldSelector(field?: string | Selector): Selector {
  if (!field) {
    return (item: any): any => item;
  }
  return typeof field === 'function'
    ? (field as Selector)
    : (item: any): any => item[String(field)];
}

function fieldComparator(field?: string | Selector): (a: any, b: any) => number {
  return (a: any, b: any): number => {
    const aVal = parseNumber(a, fieldSelector(field));
    const bVal = parseNumber(b, fieldSelector(field));

    if (bVal === undefined) {
      return 1;
    }

    if (aVal === undefined) {
      return -1;
    }

    return aVal - bVal >= 0 ? 1 : -1;
  };
}

function getNumberValuesArray(array: any[], field?: string | Selector): number[] {
  const elementSelector = fieldSelector(field);
  return array
    .map(item => parseNumber(item, elementSelector))
    .filter(v => v !== undefined) as number[];
}

/**
 * Sum of items in array.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 * @returns Sum of array.
 * @public
 * @example
 * sum([1, 2, 5]); // 8
 *
 * sum([{ val: 1 }, { val: 5 }], i => i.val); // 6
 */
export function sum(array: any[], field?: Selector | string): number | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  const elementSelector = fieldSelector(field);

  let sum = 0;
  for (const item of array) {
    const numberVal = parseNumber(item, elementSelector);
    if (numberVal) {
      sum += numberVal;
    }
  }

  return sum;
}

/**
 * Average of array items.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 * @public
 * @example
 * avg([1, 5, 3]); // 3
 */
export function avg(array: any[], field?: Selector | string): number | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  const elementSelector = fieldSelector(field);

  const s = sum(array, elementSelector);

  return s ? s / array.length : null;
}

/**
 * Computes the minimum value of array.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function min(array: any[], field?: Selector | string): number | Date | null {
  const elementSelector = fieldSelector(field);
  const numberArray = getNumberValuesArray(array, elementSelector);
  if (isArrayEmptyOrNull(numberArray)) {
    return null;
  }
  const min = Math.min(...numberArray);
  const item = elementSelector ? elementSelector(array[0]) : array[0];
  if (item instanceof Date) {
    return new Date(min);
  }
  return min;
}

/**
 * Computes the maximum value of array.
 * @public
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function max(array: any[], field?: Selector | string): number | Date | null {
  const elementSelector = fieldSelector(field);
  const numberArray = getNumberValuesArray(array, elementSelector);
  if (isArrayEmptyOrNull(numberArray)) {
    return null;
  }
  const max = Math.max(...numberArray);
  const item = elementSelector ? elementSelector(array[0]) : array[0];
  if (item instanceof Date) {
    return new Date(max);
  }
  return max;
}

/**
 * Count of elements in array.
 * @public
 * @param array The array to process.
 * @param predicate Predicate function invoked per iteration.
 */
export function count(array: any[], predicate?: Predicate): number | null {
  if (!array || !Array.isArray(array)) return null;

  if (!predicate || typeof predicate !== 'function') {
    return array.length;
  }
  return array.filter(predicate).length;
}

/**
 * Gets first item in array satisfies predicate.
 * @param array The array to process.
 * @param predicate Predicate function invoked per iteration.
 */
export function first<T = any>(array: T[], predicate?: Predicate): T | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  if (!predicate) {
    return array[0];
  }
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return array[i];
    }
  }
  return null;
}

/**
 * Gets last item in array satisfies predicate.
 * @param array The array to process.
 * @param predicate Predicate function invoked per iteration.
 */
export function last<T = any>(array: T[], predicate?: Predicate): T | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  let lastIndex = array.length - 1;
  if (!predicate) {
    return array[lastIndex];
  }

  for (; lastIndex >= 0; lastIndex--) {
    if (predicate(array[lastIndex])) {
      return array[lastIndex];
    }
  }

  return null;
}

/**
 * Gets counts map of values returned by `elementSelector`.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function countBy(array: any[], elementSelector: Selector): Record<string, number> {
  if (!array || !Array.isArray(array)) {
    throw Error('No array provided');
  }

  const results: Record<string, number> = {};
  const length = array.length;

  for (let i = 0; i < length; i++) {
    const item = array[i];
    const group = elementSelector(item);
    results[group] = results[group] || 0;
    results[group]++;
  }

  return results;
}

/**
 * Get mean of an array.
 * @param array The array to process.
 * @param field Property name or Selector function invoked per iteration.
 */
export function mean(array: any[], field?: Selector | string): number | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  let res = 0;
  for (let i = 0, c = 0, len = array.length; i < len; ++i) {
    const val = parseNumber(array[i], fieldSelector(field));
    if (typeof val === 'number') {
      const delta = val - res;
      res = res + delta / ++c;
    }
  }
  return res;
}

/**
 * Get quantile of a sorted array.
 * @param array The array to process.
 * @param field Property name or Selector function invoked per iteration.
 * @param p quantile.
 */
export function quantile(array: any[], p: number, field?: Selector | string): number | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  const len = (array.length - 1) * p + 1;
  const l = Math.floor(len);
  const elementSelector = fieldSelector(field);
  const val = elementSelector ? elementSelector(array[l - 1]) : array[l - 1];
  const e = len - l;
  return e ? val + e * (array[l] - val) : val;
}

/**
 * Get sample variance of an array.
 * @param array The array to process.
 * @param field Property name or Selector function invoked per iteration.
 */
export function variance(array: any[], field?: Selector | string): number | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  const elementSelector = fieldSelector(field);
  if (!Array.isArray(array) || array.length < 2) {
    return 0;
  }
  let mean = 0,
    M2 = 0,
    c = 0;
  for (let i = 0; i < array.length; ++i) {
    const val = parseNumber(array[i], elementSelector);
    if (typeof val === 'number') {
      const delta = val - mean;
      mean = mean + delta / ++c;
      M2 = M2 + delta * (val - mean);
    }
  }
  M2 = M2 / (c - 1);
  return M2;
}

/**
 * Get the sample standard deviation of an array.
 * @param array The array to process.
 * @param field Property name or Selector function invoked per iteration.
 */
export function stdev(array: any[], field?: Selector | string): number | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  const varr = variance(array, field);

  if (varr === null) {
    return null;
  }

  return Math.sqrt(varr);
}

/**
 * Get median of an array.
 * @param array The array to process.
 * @param field Property name or Selector function invoked per iteration.
 */
export function median(array: any[], field?: Selector | string): number | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  array.sort(fieldComparator(field));
  return quantile(getNumberValuesArray(array, field), 0.5);
}
