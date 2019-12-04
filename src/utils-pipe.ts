import {
  parseDatetimeOrNull, deepClone,
  dateToString, formatCamelStr, parseNumberOrNull
} from "./utils";

/**
 * DataUtils
 *
 * @example
 * dataUtils().parseData("10-03-2019") // Date
 */
export function utils() {
  return {
    parseDate(date: any): Date | null {
      return parseDatetimeOrNull(date);
    },
    dateToString,
    parseNumber(str: string): number | null {
      return parseNumberOrNull(str)
    },
    deepClone,
    formatCamelStr
  }
}
