import { Selector, Predicate } from "../types";
import { parseNumber } from "../utils";

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
    if (!Array.isArray(array) || !array.length) return null;

    const elementSelector = fieldSelector(field);

    let sum: number = 0;
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
    if (!Array.isArray(array)) return null;

    const elementSelector = fieldSelector(field);

    const item = elementSelector ? elementSelector(array[0]) : array[0];
    const min = Math.min(...getNumberValuesArray(array, elementSelector));
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
    if (!(Array.isArray(array) && array.length)) return null;
    const elementSelector = fieldSelector(field);

    const item = elementSelector ? elementSelector(array[0]) : array[0];
    const max = Math.max(...getNumberValuesArray(array, elementSelector));
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
    if (!Array.isArray(array)) return null;
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
    if (!Array.isArray(array) || !array.length) return null;
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

function fieldSelector(field?: string | Selector): Selector {
    if (!field) {
        return (item: any) => item;
    }
    return typeof field === 'function' ? field as Selector : (item: any) => item[String(field)];
}

function getNumberValuesArray(array: any[], elementSelector?: Selector): number[] {
    return array.map(item => parseNumber(item, elementSelector)).filter(v => v !== undefined) as number[];
}