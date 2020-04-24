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

export enum DataTypes {
    String = 'String',
    LargeString = 'LargeString',
    WholeNumber = 'WholeNumber',
    BigIntNumber = 'BigIntNumber',
    FloatNumber = 'FloatNumber',
    DateTime = 'DateTime',
    Boolean = 'Boolean'
  }
  
  export interface FieldDescription {
    fieldName: string;
    isNullable: boolean;
    maxSize?: number;
    dataType?: DataTypes;
    valuesMap?: any;
  }
  