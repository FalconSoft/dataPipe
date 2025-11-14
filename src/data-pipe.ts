import {
  sum,
  avg,
  count,
  min,
  max,
  first,
  last,
  mean,
  quantile,
  variance,
  median,
  stdev
} from './array/stats';
import {
  Selector,
  Predicate,
  ParsingOptions,
  FieldDescription,
  PrimitiveType,
  TableDto,
  DataTypeName,
  ScalarType
} from './types';
import { parseCsv, fromTable, toTable, getFieldsInfo, toCsv, JSONParser } from './utils';
import {
  leftJoin,
  innerJoin,
  fullJoin,
  merge,
  groupBy,
  sort,
  pivot,
  transpose,
  toObject,
  toSeries,
  flatten,
  flattenObject,
  unflattenObject
} from './array';

export class DataPipe<T = unknown> {
  private data: T[];

  constructor(data: T[] = []) {
    this.data = data || [];
  }

  // input methods
  fromCsv(content: string, options?: ParsingOptions): DataPipe<T> {
    this.data = parseCsv(content, options) as unknown as T[];
    return this;
  }

  parseCsv(content: string, options?: ParsingOptions): DataPipe<T> {
    return this.fromCsv(content, options);
  }

  /**
   * Loads dataPipe with Table information
   * @param rowsOrTable a datarows with 2 dimentional arrays or entire table. If you provide rows, then you have to specify fieldNames
   * @param fieldNames fieldNames what correspond to the rows
   * @param fieldDataTypes  fieldNames what correspond to the rows
   */
  fromTable(
    rowsOrTable: PrimitiveType[][] | TableDto,
    fieldNames?: string[],
    fieldDataTypes?: DataTypeName[]
  ): DataPipe<T> {
    this.data = fromTable(rowsOrTable, fieldNames, fieldDataTypes) as unknown as T[];
    return this;
  }

  // Output methods
  /**
   * Get pipes currrent array data.
   */
  toArray(): T[] {
    return this.data;
  }

  /**
   * Outputs Pipe value as CSV content
   * @param delimiter
   */
  toCsv(delimiter = ','): string {
    return toCsv(this.data as unknown as Array<Record<string, ScalarType>>, delimiter);
  }

  /**
   * Outputs pipe value as JavaScript object.
   * @param keyField a key selector represented as a string (field name) or array of stringa (fieldNames) or custom selectors
   */
  toObject(keyField: string | string[] | Selector<T, string>): Record<string, T> {
    return toObject(this.data, keyField);
  }

  /**
   * Convert array of items to into series array or series record.
   * @param propertyName optional parameter to define a property to be unpacked.
   * If it is string the array with values will be returned, otherwise an object with a list of series map
   */
  toSeries(propertyName?: string | string[]): Record<string, ScalarType[]> | ScalarType[] {
    return toSeries(this.data as unknown as Array<Record<string, unknown>>, propertyName);
  }

  /**
   * Gets table data from JSON type array.
   */
  toTable(): TableDto {
    return toTable(this.data as unknown as Array<Record<string, ScalarType>>);
  }
  // end of output functions

  /**
   * This method allows you to examine a state of the data during pipe execution.
   * @param dataFunc
   */
  tap(dataFunc: (d: T[]) => void): DataPipe<T> {
    if (typeof dataFunc === 'function') {
      dataFunc(this.data);
    }
    return this;
  }

  // Aggregation Functions

  /**
   * Sum of items in array.
   * @param elementSelector Function invoked per iteration.
   * @example
   * dataPipe([1, 2, 5]).sum(); // 8
   *
   * dataPipe([{ val: 1 }, { val: 5 }]).sum(i => i.val); // 6
   */
  sum(elementSelector?: Selector<T, ScalarType> | string): number | null {
    return sum(this.data, elementSelector);
  }

  /**
   * Average of array items.
   * @param elementSelector Function invoked per iteration.
   * @example
   * dataPipe([1, 5, 3]).avg(); // 3
   */
  avg(elementSelector?: Selector<T, ScalarType> | string): number | null {
    return avg(this.data, elementSelector);
  }

  average = this.avg.bind(this);

  /**
   * Count of elements in array.
   * @param predicate Predicate function invoked per iteration.
   */
  count(predicate?: Predicate<T>): number | null {
    return count(this.data, predicate);
  }

  /**
   * Computes the minimum value of array.
   * @param elementSelector Function invoked per iteration.
   */
  min(elementSelector?: Selector<T, ScalarType> | string): number | Date | null {
    return min(this.data, elementSelector);
  }

  /**
   * Computes the maximum value of array.
   * @param elementSelector Function invoked per iteration.
   */
  max(elementSelector?: Selector<T, ScalarType> | string): number | Date | null {
    return max(this.data, elementSelector);
  }

  /**
   * Gets first item in array satisfies predicate.
   * @param predicate Predicate function invoked per iteration.
   */
  first(predicate?: Predicate<T>): T | null | undefined {
    return first(this.data, predicate);
  }

  /**
   * Gets last item in array satisfies predicate.
   * @param array The array to process.
   * @param predicate Predicate function invoked per iteration.
   */
  last(predicate?: Predicate<T>): T | null | undefined {
    return last(this.data, predicate);
  }

  /**
   * Get mean.
   * @param field Property name or Selector function invoked per iteration.
   */
  mean(field?: Selector<T, ScalarType> | string): number | null {
    return mean(this.data, field);
  }

  /**
   * Get quantile of a sorted array.
   * @param field Property name or Selector function invoked per iteration.
   * @param p quantile.
   */
  quantile(p: number, field?: Selector<T, ScalarType> | string): number | null {
    return quantile(this.data, p, field);
  }

  /**
   * Get variance.
   * @param field Property name or Selector function invoked per iteration.
   */
  variance(field?: Selector<T, ScalarType> | string): number | null {
    return variance(this.data, field);
  }

  /**
   * Get the standard deviation.
   * @param field Property name or Selector function invoked per iteration.
   */
  stdev(field?: Selector<T, ScalarType> | string): number | null {
    return stdev(this.data, field);
  }

  /**
   * Get median.
   * @param field Property name or Selector function invoked per iteration.
   */
  median(field?: Selector<T, ScalarType> | string): number | null {
    return median(this.data, field);
  }

  // Data Transformation functions
  /**
   * Groups array items based on elementSelector function
   * @param elementSelector Function invoked per iteration.
   */
  groupBy(elementSelector: string | string[] | Selector<T, string>): DataPipe<T[]> {
    this.data = groupBy(this.data, elementSelector as string | string[] | Selector) as unknown as T[];
    return this as unknown as DataPipe<T[]>;
  }

  /**
   * Joins two arrays together by selecting elements that have matching values in both arrays
   * @param rightArray array of elements to join
   * @param leftKey left Key
   * @param rightKey
   * @param resultSelector
   */
  innerJoin<TRight, TResult = T>(
    rightArray: TRight[],
    leftKey: string | string[] | Selector<T, string>,
    rightKey: string | string[] | Selector<TRight, string>,
    resultSelector: (leftItem: T | null, rightItem: TRight | null) => TResult
  ): DataPipe<TResult> {
    this.data = innerJoin(this.data, rightArray, leftKey, rightKey, resultSelector) as unknown as T[];
    return this as unknown as DataPipe<TResult>;
  }

  leftJoin<TRight, TResult = T>(
    rightArray: TRight[],
    leftKey: string | string[] | Selector<T, string>,
    rightKey: string | string[] | Selector<TRight, string>,
    resultSelector: (leftItem: T | null, rightItem: TRight | null) => TResult
  ): DataPipe<TResult> {
    this.data = leftJoin(this.data, rightArray, leftKey, rightKey, resultSelector) as unknown as T[];
    return this as unknown as DataPipe<TResult>;
  }

  fullJoin<TRight, TResult = T | TRight>(
    rightArray: TRight[],
    leftKey: string | string[] | Selector<T, string>,
    rightKey: string | string[] | Selector<TRight, string>,
    resultSelector: (leftItem: T | null, rightItem: TRight | null) => TResult
  ): DataPipe<TResult> {
    this.data = fullJoin(this.data, rightArray, leftKey, rightKey, resultSelector) as unknown as T[];
    return this as unknown as DataPipe<TResult>;
  }

  /**
   * Select data from array item.
   * @param elementSelector Function invoked per iteration.
   * @example
   *
   * dataPipe([{ val: 1 }, { val: 5 }]).select(i => i.val).toArray(); // [1, 5]
   */
  select<TResult>(elementSelector: Selector<T, TResult>): DataPipe<TResult> {
    this.data = this.data.map(elementSelector) as unknown as T[];
    return this as unknown as DataPipe<TResult>;
  }

  map = this.select.bind(this);

  merge<TSource>(
    sourceArray: TSource[],
    targetKey: string | string[] | Selector<T, string>,
    sourceKey: string | string[] | Selector<TSource, string>
  ): DataPipe<T> {
    this.data = merge(this.data, sourceArray, targetKey, sourceKey);
    return this;
  }

  flattenObject(): unknown {
    return flattenObject(this.data);
  }

  unflattenObject(): unknown {
    return unflattenObject(this.data);
  }

  flatten(): unknown {
    return flatten(this.data);
  }

  pivot(
    rowFields: string | string[],
    columnField: string,
    dataField: string,
    aggFunction?: (array: unknown[]) => unknown | null,
    columnValues?: string[]
  ): DataPipe<Record<string, unknown>> {
    this.data = pivot(this.data as Array<Record<string, unknown>>, rowFields, columnField, dataField, aggFunction, columnValues) as unknown as T[];
    return this as unknown as DataPipe<Record<string, unknown>>;
  }

  transpose(): DataPipe<Record<string, unknown>> {
    this.data = transpose(this.data as Array<Record<string, unknown>>) as unknown as T[] || [] as unknown as T[];
    return this as unknown as DataPipe<Record<string, unknown>>;
  }

  /**
   * Filters array of items.
   * @param predicate Predicate function invoked per iteration.
   */
  where(predicate: Predicate<T>): DataPipe<T> {
    this.data = this.data.filter(predicate);
    return this;
  }

  filter = this.where.bind(this);

  /**
   * Get unique values
   * @param elementSelector Function invoked per iteration.
   */
  unique<TResult = T>(elementSelector?: Selector<T, TResult>): DataPipe<T | TResult> {
    if (elementSelector) {
      this.select(elementSelector);
    }
    this.data = Array.from(new Set(this.data));
    return this as unknown as DataPipe<T | TResult>;
  }

  distinct = this.unique.bind(this);

  /**
   * Sort array.
   * @param fields sorts order.
   * @example
   * dp.sort('name ASC', 'age DESC');
   */
  sort(...fields: string[]): DataPipe<T> {
    sort(this.data, ...fields);
    return this;
  }

  // end of transformation functions

  /**
   * generates a field descriptions (first level only) that can be used for relational table definition.
   * if any properties are Objects, it would use JSON.stringify to calculate maxSize field.
   */
  getFieldsInfo(): FieldDescription[] {
    return getFieldsInfo(this.data as unknown as Array<Record<string, ScalarType>>);
  }

  JSONParser(): JSONParser {
    return new JSONParser();
  }
}
