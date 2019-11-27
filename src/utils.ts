import { Selector } from "./models";

/**
 * Get selector number values.
 * @param array The array to process.
 * @param elementSelector Function invoked per iteration.
 * @private
 */
export function getNumberValuesArray(array: any[], elementSelector?: Selector): number[] {
  return array.map(item => parseNumber(item, elementSelector)).filter(v => v !== undefined) as number[];
}

/**
 * Formats selected value to number.
 * @private
 * @param val Primitive or object.
 * @param elementSelector Function invoked per iteration.
 */
export function parseNumber(val: any, elementSelector?: Selector): number | undefined {
  if (elementSelector && typeof elementSelector === 'function') {
    val = elementSelector(val);
  }
  switch (typeof val) {
    case 'string': {
      const fV = parseFloat(val);
      if (!isNaN(fV)) {
        return fV;
      }
      break;
    }
    case 'boolean': return Number(val);
    case 'number': return isNaN(val) ? undefined : val;
  }
}
