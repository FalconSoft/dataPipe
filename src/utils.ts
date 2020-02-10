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
  if (val instanceof Date) {
    return val.getTime();
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

export function parseNumberOrNull(value: string | number): number | null {
  if (typeof value === 'number') {
    return value;
  }

  if (!value || typeof value !== 'string') {
    return null;
  }

  // Just to make sure string contains digits only and '.', ','. Otherwise, parseFloat can incorrectly parse into number
  for (let i = value.length - 1; i >= 0; i--) {
    const d = value.charCodeAt(i);
    if (d < 48 || d > 57) {
      // '.' - 46 ',' - 44
      if (d !== 46 && d !== 44)
        return null;
    }
  }

  const res = parseFloat(value.replace(/,/g, ''));
  return !isNaN(res) ? res : null;
}
/**
 * More wider datetime parser
 * @param value
 */
export function parseDatetimeOrNull(value: string | Date): Date | null {
  if (!value) { return null; }
  if (value instanceof Date && !isNaN(value.valueOf())) { return value; }
  // only string values can be converted to Date
  if (typeof value !== 'string') { return null; }

  const strValue = String(value);
  if (!strValue.length) { return null; }

  const parseMonth = (mm: string): number => {
    if (!mm || !mm.length) {
      return NaN;
    }

    const m = parseInt(mm, 10);
    if (!isNaN(m)) {
      return m - 1;
    }

    // make sure english months are coming through
    if (mm.startsWith('jan')) { return 0; }
    if (mm.startsWith('feb')) { return 1; }
    if (mm.startsWith('mar')) { return 2; }
    if (mm.startsWith('apr')) { return 3; }
    if (mm.startsWith('may')) { return 4; }
    if (mm.startsWith('jun')) { return 5; }
    if (mm.startsWith('jul')) { return 6; }
    if (mm.startsWith('aug')) { return 7; }
    if (mm.startsWith('sep')) { return 8; }
    if (mm.startsWith('oct')) { return 9; }
    if (mm.startsWith('nov')) { return 10; }
    if (mm.startsWith('dec')) { return 11; }

    return NaN;
  };

  const correctYear = (yy: number) => {
    if (yy < 100) {
      return yy < 68 ? yy + 2000 : yy + 1900;
    } else {
      return yy;
    }
  };

  const validDateOrNull =
    (yyyy: number, month: number, day: number, hours: number, mins: number, ss: number): Date | null => {
      if (month > 11 || day > 31 || hours >= 60 || mins >= 60 || ss >= 60) { return null; }

      const dd = new Date(yyyy, month, day, hours, mins, ss, 0);
      return !isNaN(dd.valueOf()) ? dd : null;
    };

  const strTokens = strValue.replace('T', ' ').toLowerCase().split(/[: /-]/);
  const dt = strTokens.map(parseFloat);

  // try ISO first
  let d = validDateOrNull(dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0, dt[5] || 0);
  if (d) { return d; }

  // then UK
  d = validDateOrNull(correctYear(dt[2]), parseMonth(strTokens[1]), dt[0], dt[3] || 0, dt[4] || 0, dt[5] || 0);
  if (d) { return d; }

  // then US
  d = validDateOrNull(correctYear(dt[2]), parseMonth(strTokens[0]), correctYear(dt[1]), dt[3] || 0, dt[4] || 0, dt[5] || 0);
  if (d) { return d; }

  return null;
}

export function dateToString(d: Date): string {
  const date = new Date(d.getTime());
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().replace('T00:00:00.000Z', '');
}

export function deepClone(obj: any): any {

  if (obj == null || obj == undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (Array.isArray(obj)) {
    return obj.map(v => deepClone(v))
  }

  if (typeof obj === 'object') {
    const clone = <any>{};
    for (const propName in obj) {
      const propValue = obj[propName];

      if (propValue == null || propValue == undefined) {
        clone[propName] = propValue;
      } else if (propValue instanceof Date) {
        clone[propName] = new Date(propValue.getTime());
      } else if (Array.isArray(propValue)) {
        clone[propName] = propValue.map(v => deepClone(v));
      } else if (typeof (propValue) == "object") {
        clone[propName] = deepClone(propValue);
      } else {
        clone[propName] = propValue;
      }
    }
    return clone;
  }

  return obj;
}

export function formatCamelStr(str: string = ''): string {
  return str.replace(/^\w/, c => c.toUpperCase()).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
}
