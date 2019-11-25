import { Selector, Predicate } from "./models";

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
export function sum(array: any[], elementSelector?: Selector): number | undefined {
  if (!Array.isArray(array)) return;
  const sum: number = (array.reduce((prev: number, val) => {
    const numberVal = getNumberValue(val, elementSelector);
    if (numberVal !== undefined) {
      prev += numberVal;
    }
    return prev;
  }, 0) as number);
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
export function avg(array: any[], elementSelector?: Selector): number | undefined {
  const s = sum(array, elementSelector);
  if (s) {
    return s / array.length;
  }
}

/**
 * Count of elements in array.
 * @public
 * @param array The array to process.
 * @param predicate Predicate function invoked per iteration.
 */
export function count(array: any[], predicate?: Predicate): number | undefined {
  if (!Array.isArray(array)) return;
  if (!predicate || typeof predicate !== 'function') {
    return array.length;
  }
  return array.filter(predicate).length;
}

/**
 * Computes the minimum value of array.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function min(array: any[], elementSelector?: Selector): number | undefined {
  if (!Array.isArray(array)) return;
  return Math.min(...getNumberValuesArray(array, elementSelector));
}

/**
 * Computes the maximum value of array.
 * @public
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function max(array: any[], elementSelector?: Selector): number | null {
  if (!Array.isArray(array)) return null;
  return Math.max(...getNumberValuesArray(array, elementSelector));
}

/**
 * Gets first item in array satisfies predicate.
 * @param array The array to process.
 * @param predicate Predicate function invoked per iteration.
 */
export function first<T = any>(array: T[], predicate?: Predicate): T | undefined {
  if (!Array.isArray(array) || !array.length) return;
  if (!predicate) {
    return array[0];
  }
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return array[i];
    }
  }
}

/**
 * Gets last item in array satisfies predicate.
 * @param array The array to process.
 * @param predicate Predicate function invoked per iteration.
 */
export function last<T = any>(array: T[], predicate?: Predicate): T | undefined {
  if (!Array.isArray(array) || !array.length) return;
  let lastIndex = array.length - 1;
  if (!predicate) {
    return array[lastIndex];
  }

  for (; lastIndex >= 0; lastIndex--) {
    if (predicate(array[lastIndex])) {
      return array[lastIndex];
    }
  }
}

/**
 * Groups array items based on elementSelector function
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function groupBy<T = any>(array: T[], elementSelector: Selector): Array<T[]> {
  const groups: { [key: string]: T[] } = {};
  const length = array.length;

  for (let i = 0; i < length; i++) {
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
 * Gets counts map of values returned by `elementSelector`.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 */
export function countBy(array: any[], elementSelector: Selector): { [key: string]: number } {
  const results: { [key: string]: number } = {};
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
 * Joins data in array by elementSelector functions.
 * @param array The array to process.
 * @param array2 The array to join.
 * @param elementSelector Gets key value of array.
 * @param elementSelector2 Gets key value of array2.
 */
export function joinArray(array: any[], array2: object[], elementSelector: Selector, elementSelector2: Selector): any[] {
  const length = array.length;
  const res = [];
  for (let i = 0; i < length; i++) {
    const item = array[i];
    const item2 = array2.find(item2 => elementSelector(item) === elementSelector2(item2));
    res.push({ ...item, ...item2 })
  }

  return res;
}

/**
 * Get selector number values.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 * @private
 */
function getNumberValuesArray(array: any[], elementSelector?: Selector): number[] {
  return array.map(item => getNumberValue(item, elementSelector)).filter(v => v !== undefined) as number[];
}

/**
 * Formats selected value to number.
 * @private
 * @param val Primitive or object.
 * @param elementSelector Function invoked per iteration.
 */
function getNumberValue(val: any, elementSelector?: Selector): number | undefined {
  if (elementSelector && typeof elementSelector === 'function') {
    val = elementSelector(val);
  }
  switch (typeof val) {
    case 'string': return parseFloat(val);
    case 'boolean': return Number(val);
    case 'number': return val;
  }
}
