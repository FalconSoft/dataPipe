import { Selector, FieldDescription, DataTypeName, ScalarType, PrimitiveType } from "../types";

/**
 * Formats selected value to number.
 * @private
 * @param val Primitive or object.
 * @param elementSelector Function invoked per iteration.
 */
export function parseNumber(val: ScalarType, elementSelector?: Selector): number | undefined {
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

  value = value.trim();

  // Just to make sure string contains digits only and '.', ','. Otherwise, parseFloat can incorrectly parse into number
  for (let i = value.length - 1; i >= 0; i--) {
    const d = value.charCodeAt(i);
    if (d < 48 || d > 57) {
      // '.' - 46 ',' - 44 '-' - 45(but only first char)
      if (d !== 46 && d !== 44 && (d !== 45 || i !== 0))
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
export function parseDatetimeOrNull(value: string | Date, format: string | null = null): Date | null {
  format = (format || '').toLowerCase();
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

  const correctYear = (yy: number): number => {
    if (yy < 100) {
      return yy < 68 ? yy + 2000 : yy + 1900;
    } else {
      return yy;
    }
  };

  const validDateOrNull =
    (yyyy: number, month: number, day: number, hours: number, mins: number, ss: number, ms: number): Date | null => {
      if (month > 11 || day > 31 || hours >= 60 || mins >= 60 || ss >= 60) { return null; }

      const dd = new Date(yyyy, month, day, hours, mins, ss, ms);
      return !isNaN(dd.valueOf()) ? dd : null;
    };

  const strTokens = strValue.replace('T', ' ').replace('.', ' ').toLowerCase().split(/[: /-]/);
  const dt = strTokens.map(parseFloat);

  let d: Date | null = null;

  if (format.startsWith('mm/dd/yy') || format.startsWith('mmm/dd/yy')
    || format.startsWith('mm-dd-yy') || format.startsWith('mmm-dd-yy')) {
    // handle US format
    return validDateOrNull(correctYear(dt[2]), parseMonth(strTokens[0]), dt[1], dt[3] || 0, dt[4] || 0, dt[5] || 0, dt[6] || 0);
  } else if (format.startsWith('yyyymm')) {
    return validDateOrNull(
      parseInt(value.substring(0, 4)),
      parseInt(value.substring(4, 6)) - 1,
      (value.length > 6) ? parseInt(value.substring(6, 8)) : 1, 0, 0, 0, 0)
  } else if (format.startsWith('dd/mm/yy') || format.startsWith('dd/mmm/yy')
    || format.startsWith('dd-mm-yy') || format.startsWith('dd-mmm-yy')) {
    return validDateOrNull(correctYear(dt[2]), parseMonth(strTokens[1]), dt[0], dt[3] || 0, dt[4] || 0, dt[5] || 0, dt[6] || 0);
  } else if (format.startsWith('yyyy-mm')) {
    return validDateOrNull(dt[0], parseMonth(strTokens[1]), dt[2] || 1, dt[3] || 0, dt[4] || 0, dt[5] || 0, dt[6] || 0);
  } else if (format.length) {
    throw new Error(`Unrecognized format '${format}'`);
  }


  // try ISO first
  d = validDateOrNull(dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0, dt[5] || 0, dt[6] || 0);
  if (d) { return d; }

  // then UK
  d = validDateOrNull(correctYear(dt[2]), parseMonth(strTokens[1]), dt[0], dt[3] || 0, dt[4] || 0, dt[5] || 0, dt[6] || 0);
  if (d) { return d; }

  // then US guess
  return validDateOrNull(correctYear(dt[2]), parseMonth(strTokens[0]), dt[1], dt[3] || 0, dt[4] || 0, dt[5] || 0, dt[6] || 0);

  return null;
}

export function parseBooleanOrNull(val: boolean | string): boolean | null {
  if (!val) { return null; }
  if (typeof val === 'boolean') { return val; }

  const trulyVals = ['1', 'yes', 'true', 'on'];
  const falsyVals = ['0', 'no', 'false', 'off'];
  const checkVal = val.toString().toLowerCase().trim();

  if (trulyVals.includes(checkVal)) {
    return true;
  }

  if (falsyVals.includes(checkVal)) {
    return false;
  }

  return null;
}

export function addDays(dt: Date, daysOffset: number): Date {
  if (!dt || !(dt instanceof Date)) {
    throw new Error('First parameter must be Date');
  }

  dt.setDate(dt.getDate() + daysOffset);
  return dt;
}

export function addBusinessDays(dt: Date, bDaysOffset: number): Date {
  if (!dt || !(dt instanceof Date)) {
    throw new Error('First parameter must be Date');
  }
  dt.setDate(dt.getDate() + bDaysOffset);

  // skip saturdays and sundays
  if (bDaysOffset < 0) {
    while (dt.getDay() === 0 || dt.getDay() === 6) {
      dt.setDate(dt.getDate() - 1);
    }
  } else {
    while (dt.getDay() === 0 || dt.getDay() === 6) {
      dt.setDate(dt.getDate() + 1);
    }
  }
  return dt;
}


export function dateToString(d: Date, format?: string): string {
  const date = new Date(d.getTime());
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  const strDate = date.toISOString().replace('T00:00:00.000Z', '');

  if (format) {
    // a quick and dirty way to achive a most used formats
    const t = strDate.split(/[.T:Z /-]/);
    const f = {
      yyyy: t[0],
      yy: t[0].slice(2),
      mm: t[1],
      dd: t[2]
    }

    if (format.toLowerCase() === 'dd/mm/yyyy') {
      return `${f.dd}/${f.mm}/${f.yyyy}`;
    } else if (format.toLowerCase() === 'mm/dd/yyyy') {
      return `${f.mm}/${f.dd}/${f.yyyy}`;
    } else if (format.toLowerCase() === 'dd/mm/yy') {
      return `${f.dd}/${f.mm}/${f.yy}`;
    } else if (format.toLowerCase() === 'yyyymmdd') {
      return `${f.yyyy}${f.mm}${f.dd}`;
    } else if (format.toLowerCase() === 'mm-dd-yyyy') {
      return `${f.mm}-${f.dd}-${f.yyyy}`;
    } else if (format.toLowerCase() === 'mm-dd-yy') {
      return `${f.mm}-${f.dd}-${f.yy}`;
    } else if (format.toLowerCase() === 'dd-mm-yyyy') {
      return `${f.dd}-${f.mm}-${f.yyyy}`;
    } else if (format.toLowerCase() === 'yyyy-mm-dd') {
      return `${f.yyyy}-${f.mm}-${f.dd}`;
    } else {
      throw new Error(`Unsupported format ${format}`);
    }
  }

  return strDate;
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
    const clone = {} as any;
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

export function workoutDataType(value: ScalarType, inType: DataTypeName | undefined): DataTypeName | undefined {

  function getRealType(val: ScalarType): DataTypeName {

    function processNumber(num: number): DataTypeName {
      if (num % 1 === 0) {
        return (num > 2147483647) ? DataTypeName.BigIntNumber : DataTypeName.WholeNumber;
      } else {
        return DataTypeName.FloatNumber;
      }
    }

    let num = null;
    let bl = null;

    switch (typeof val) {
      case 'boolean': return DataTypeName.Boolean;
      case 'number':
        return processNumber(val)
      case 'object':
        if (val instanceof Date) return DataTypeName.DateTime;
        return DataTypeName.String;
      case 'string':
        if (parseDatetimeOrNull(val)) { return DataTypeName.DateTime; }
        num = parseNumberOrNull(val);
        if (num !== null) { return processNumber(num); }

        bl = parseBooleanOrNull(val);
        if (bl !== null) { return DataTypeName.Boolean; }

        return (val.length > 4000) ? DataTypeName.LargeString : DataTypeName.String;

      default: return DataTypeName.LargeString
    }
  }

  if (value == null || value == undefined) { return undefined; }

  // no point to proceed, string is most common type
  if (inType === DataTypeName.LargeString) { return DataTypeName.LargeString; }

  const realType = getRealType(value);

  if (inType === undefined) {
    return realType;
  } else {
    // normal case. Means all values in column are the same
    if (inType === realType) { return inType; }

    // if any of items are string, then it must be string
    if (realType === DataTypeName.String) { return DataTypeName.String; }
    if (inType === DataTypeName.String && realType !== DataTypeName.LargeString) { return DataTypeName.String; }

    if (inType === DataTypeName.FloatNumber) { return DataTypeName.FloatNumber; }
    if (realType === DataTypeName.FloatNumber && inType === DataTypeName.WholeNumber) {
      return DataTypeName.FloatNumber;
    }

    if (realType === DataTypeName.BigIntNumber) { return DataTypeName.BigIntNumber; }
    if (inType === DataTypeName.BigIntNumber && realType === DataTypeName.WholeNumber) {
      return DataTypeName.BigIntNumber;
    }

    if (realType !== inType && realType !== DataTypeName.LargeString) {
      return DataTypeName.String;
    }

    return DataTypeName.LargeString;
  }

  return undefined;
}

/**
   * generates a field descriptions (first level only) that can be used for relational table definition.
   * if any properties are Objects, it would use JSON.stringify to calculate maxSize field.
 * @param items 
 */
export function createFieldDescriptions(items: Record<string, ScalarType>[]): FieldDescription[] {

  const resultMap: Record<string, FieldDescription> = Object.create(null);
  const valuesMap: Record<string, Set<string>> = Object.create(null);

  let index = 0;
  for (const item of items) {

    for (const [name, value] of Object.entries(item)) {
      let fDesc = resultMap[name];
      let valuesSet = valuesMap[name];

      if (valuesSet === undefined) {
        valuesSet = valuesMap[name] = new Set<string>();
      }

      if (fDesc === undefined) {
        fDesc = {
          index: index++,
          fieldName: name,
          isNullable: false
        } as FieldDescription;
        resultMap[name] = fDesc;
      }

      const strValue: PrimitiveType =
        value instanceof Date ? dateToString(value)
          : typeof value === 'object' ? JSON.stringify(value)
            : String(value);

      if (!fDesc.isObject) {
        fDesc.isObject = typeof value === 'object';
      }

      if (value === null || value === undefined) {
        fDesc.isNullable = true
      } else {
        const newType = workoutDataType(value, fDesc.dataTypeName);
        if (newType !== fDesc.dataTypeName) {
          fDesc.dataTypeName = newType;
        }

        if ((fDesc.dataTypeName == DataTypeName.String || fDesc.dataTypeName == DataTypeName.LargeString) && strValue.length > (fDesc.maxSize || 0)) {
          fDesc.maxSize = strValue.length;
        }
      }

      if (!valuesSet.has(strValue)) {
        valuesSet.add(strValue);
      }
    }
  }

  const fields = Object.values(resultMap)
    .sort((a: FieldDescription, b: FieldDescription) => (a.index > b.index) ? 1 : ((b.index > a.index) ? -1 : 0))

  return fields
    .map(r => {
      r.isUnique = valuesMap[r.fieldName].size === items.length;
      return r;
    });
}
