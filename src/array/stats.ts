import { Selector, Predicate, ScalarType } from '../types';
import { parseNumber } from '../utils';
import { isArrayEmptyOrNull } from './utils';

function fieldSelector<T = unknown>(field?: string | Selector<T, ScalarType>): Selector<T, ScalarType> {
  if (!field) {
    return (item: T): ScalarType => item as unknown as ScalarType;
  }
  return typeof field === 'function'
    ? (field as Selector<T, ScalarType>)
    : (item: T): ScalarType => (item as Record<string, unknown>)[String(field)] as ScalarType;
}

function fieldComparator<T = unknown>(field?: string | Selector<T, ScalarType>): (a: T, b: T) => number {
  return (a: T, b: T): number => {
    const selector = fieldSelector(field);
    const aVal = parseNumber(selector(a) as ScalarType);
    const bVal = parseNumber(selector(b) as ScalarType);

    if (bVal === undefined) {
      return 1;
    }

    if (aVal === undefined) {
      return -1;
    }

    return aVal - bVal >= 0 ? 1 : -1;
  };
}

function getNumberValuesArray<T = unknown>(array: T[], field?: string | Selector<T, ScalarType>): number[] {
  const elementSelector = fieldSelector(field);
  return array
    .map(item => parseNumber(elementSelector(item) as ScalarType))
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
export function sum<T = unknown>(array: T[], field?: Selector<T, ScalarType> | string): number | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  const elementSelector = fieldSelector(field);

  let sum = 0;
  for (const item of array) {
    const numberVal = parseNumber(elementSelector(item) as ScalarType);
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
export function avg<T = unknown>(array: T[], field?: Selector<T, ScalarType> | string): number | null {
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
export function min<T = unknown>(array: T[], field?: Selector<T, ScalarType> | string): number | Date | null {
  const elementSelector = fieldSelector(field);
  const numberArray = getNumberValuesArray(array, elementSelector);
  if (isArrayEmptyOrNull(numberArray)) {
    return null;
  }
  const min = Math.min(...numberArray);
  const item = field ? elementSelector(array[0]) : array[0];
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
export function max<T = unknown>(array: T[], field?: Selector<T, ScalarType> | string): number | Date | null {
  const elementSelector = fieldSelector(field);
  const numberArray = getNumberValuesArray(array, elementSelector);
  if (isArrayEmptyOrNull(numberArray)) {
    return null;
  }
  const max = Math.max(...numberArray);
  const item = field ? elementSelector(array[0]) : array[0];
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
export function count<T = unknown>(array: T[], predicate?: Predicate<T>): number | null {
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
export function first<T = unknown>(array: T[], predicate?: Predicate<T>): T | null {
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
export function last<T = unknown>(array: T[], predicate?: Predicate<T>): T | null {
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
export function countBy<T = unknown>(array: T[], elementSelector: Selector<T, ScalarType>): Record<string, number> {
  if (!array || !Array.isArray(array)) {
    throw Error('No array provided');
  }

  const results: Record<string, number> = {};
  const length = array.length;

  for (let i = 0; i < length; i++) {
    const item = array[i];
    const group = String(elementSelector(item));
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
export function mean<T = unknown>(array: T[], field?: Selector<T, ScalarType> | string): number | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  let res = 0;
  for (let i = 0, c = 0, len = array.length; i < len; ++i) {
    const selector = fieldSelector(field);
    const val = parseNumber(selector(array[i]) as ScalarType);
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
export function quantile<T = unknown>(array: T[], p: number, field?: Selector<T, ScalarType> | string): number | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  const numberArray = getNumberValuesArray(array, field);
  const len = (numberArray.length - 1) * p + 1;
  const l = Math.floor(len);
  const val = numberArray[l - 1];
  const e = len - l;
  return e ? val + e * (numberArray[l] - val) : val;
}

/**
 * Get sample variance of an array.
 * @param array The array to process.
 * @param field Property name or Selector function invoked per iteration.
 */
export function variance<T = unknown>(array: T[], field?: Selector<T, ScalarType> | string): number | null {
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
    const val = parseNumber(elementSelector(array[i]) as ScalarType);
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
export function stdev<T = unknown>(array: T[], field?: Selector<T, ScalarType> | string): number | null {
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
export function median<T = unknown>(array: T[], field?: Selector<T, ScalarType> | string): number | null {
  if (isArrayEmptyOrNull(array)) {
    return null;
  }

  array.sort(fieldComparator(field));
  return quantile(getNumberValuesArray(array, field), 0.5);
}
