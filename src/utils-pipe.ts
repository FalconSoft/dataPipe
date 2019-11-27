import { parseNumber } from "./utils";

/**
 * DataUtils
 *
 * @example
 * dataUtils().parseData("10-03-2019") // Date
 */
export default function dataUtils() {
  return {
    parseDate(date: any): Date|undefined {
      switch (typeof date) {
        case 'string':
        case 'number': {
          const d = new Date(date);
          if (!isNaN(d.getTime())) {
            return d;
          }
          break;
        };
        case 'object': {
          if (date instanceof Date) {
            return date;
          }
        }
      }
    },
    parseNumber
  }
}
