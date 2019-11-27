import { Selector } from "./models";

/**
 * Get selector number values.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 * @private
 */
export function getNumberValuesArray(array: any[], elementSelector?: Selector): number[] {
  return array.map(item => getNumberValue(item, elementSelector)).filter(v => v !== undefined) as number[];
}

/**
 * Formats selected value to number.
 * @private
 * @param val Primitive or object.
 * @param elementSelector Function invoked per iteration.
 */
export function getNumberValue(val: any, elementSelector?: Selector): number | undefined {
  if (elementSelector && typeof elementSelector === 'function') {
    val = elementSelector(val);
  }
  switch (typeof val) {
    case 'string': return parseFloat(val);
    case 'boolean': return Number(val);
    case 'number': return val;
  }
}
