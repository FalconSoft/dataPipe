export type Predicate<T = any> = (p: T) => boolean;
export type Selector<T = any, V = any> = (p: T) => V;
export class ParsingOptions {
  delimiter = ',';
  skipRows = 0;
  dateFields: string[] = [];
  numberFields: string[] = [];
  booleanFields: string[] = [];
  skipUntil?: (tokens: string[]) => boolean;
  takeWhile?: (tokens: string[]) => boolean;
  parseFields?: {};
  elementSelector?: (headers: string[], tokens: string[]) => any;
}

export type PrimitiveType = string | number | bigint | boolean | null;

/**
 * ScalarType represent a single value types what includes Date and can be null
 */
export type ScalarType = PrimitiveType | Date;

/**
 * Scalar object is a simple object where key is always string and value could be a ScalarType only
 * Scalar type includes Date object
 */
export type ScalarObject = Record<string, ScalarType>;

/**
 * PrimitivesObject is a simple object where key is a string and value can be Primitive
 * This object can be transfered with REST call. Doesn'r have a Date
 */
export type PrimitivesObject = Record<string, PrimitiveType>;

/**
 * Commonly used and recognized types
 */
export enum DataTypeName {
  String = 'String',
  LargeString = 'LargeString',
  WholeNumber = 'WholeNumber',
  BigIntNumber = 'BigIntNumber',
  FloatNumber = 'FloatNumber',
  DateTime = 'DateTime',
  Boolean = 'Boolean'
}

export interface Table<T> {
  fieldDataTypes?: DataTypeName[];
  fieldNames: string[];
  rows: T[][];
}


/**
 * A simple data table structure what provides a most efficient way
 * to send data across the wire
 */
export type TableDto = Table<PrimitiveType>;

export type ScallarTable = Table<ScalarType>;

export interface FieldDescription {
  fieldName: string;
  isNullable: boolean;
  maxSize?: number;
  dataTypeName?: DataTypeName;
  valuesMap: Map<PrimitiveType, number>;
}
