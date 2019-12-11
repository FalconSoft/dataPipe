import { sum, avg, count, min, max, first, last, groupBy, flatten, countBy, joinArray } from './array';
import { Selector, Predicate } from './models';
import { fromTable, toTable } from './table';

export class DataPipe<T = any> {
  private data: Array<T | any>;

  constructor(data: T[] = []) {
    this.data = data;
  }

  /**
   * Get pipes currrent array data.
   */
  toArray(): T[] {
    return this.data;
  }

  /**
   * Sum of items in array.
   * @param elementSelector Function invoked per iteration.
   * @example
   * dataPipe([1, 2, 5]).sum(); // 8
   *
   * dataPipe([{ val: 1 }, { val: 5 }]).sum(i => i.val); // 6
   */
  sum(elementSelector?: Selector): number | undefined {
    return sum(this.data, elementSelector);
  }

  /**
   * Select data from array item.
   * @param elementSelector Function invoked per iteration.
   * @example
   *
   * dataPipe([{ val: 1 }, { val: 5 }]).select(i => i.val).toArray(); // [1, 5]
   */
  select(elementSelector: Selector): DataPipe {
    this.data = this.data.map(elementSelector);
    return this;
  }

  map = this.select.bind(this);

  /**
   * Average of array items.
   * @param elementSelector Function invoked per iteration.
   * @example
   * dataPipe([1, 5, 3]).avg(); // 3
   */
  avg(elementSelector?: Selector): number | undefined {
    return avg(this.data, elementSelector);
  }

  average = this.avg.bind(this);

  /**
   * Count of elements in array.
   * @param predicate Predicate function invoked per iteration.
   */
  count(predicate?: Predicate): number | undefined {
    return count(this.data, predicate);
  }

  /**
   * Computes the minimum value of array.
   * @param elementSelector Function invoked per iteration.
   */
  min(elementSelector?: Selector): number | Date | undefined {
    return min(this.data, elementSelector);
  }

  /**
   * Computes the maximum value of array.
   * @param elementSelector Function invoked per iteration.
   */
  max(elementSelector?: Selector): number | Date | null {
    return max(this.data, elementSelector);
  }

  /**
   * Gets first item in array satisfies predicate.
   * @param predicate Predicate function invoked per iteration.
   */
  first(predicate?: Predicate): T | undefined {
    return first(this.data, predicate);
  }

  /**
   * Gets last item in array satisfies predicate.
   * @param array The array to process.
   * @param predicate Predicate function invoked per iteration.
   */
  last(predicate?: Predicate): T | undefined {
    return last(this.data, predicate);
  }

  /**
   * Groups array items based on elementSelector function
   * @param elementSelector Function invoked per iteration.
   */
  groupBy(elementSelector: Selector): DataPipe {
    this.data = groupBy(this.data, elementSelector);
    return this;
  }

  /**
   * Flattens array.
   * @example
   * dataPipe([1, 4, [2, [5, 5, [9, 7]], 11], 0]).flatten(); // length 9
   */
  flatten(): T[] {
    return flatten(this.data);
  }

  /**
   * Gets counts map of values returned by `elementSelector`.
   * @param elementSelector Function invoked per iteration.
   */
  countBy(elementSelector: Selector): { [key: string]: number } {
    return countBy(this.data, elementSelector);
  }

  /**
   * Joins data in array by iteratee functions.
   * @param array2 The array to join.
   * @param keySelector1 Gets key value of array.
   * @param keySelector1 Gets key value of array2.
   */
  joinArray(array2: object[], keySelector1: Selector, keySelector2: Selector): DataPipe {
    this.data = joinArray(this.data, array2, keySelector1, keySelector2);
    return this;
  }

  /**
   * Gets joined as sring array items.
   * @param separator String separator.
   */
  join(separator?: string): string {
    return this.data.join(separator);
  }

  /**
   * Filters array of items.
   * @param predicate Predicate function invoked per iteration.
   */
  where(predicate: Predicate): DataPipe {
    this.data = this.data.filter(predicate);
    return this;
  }

  filter = this.where.bind(this);


  /**
   * Get JSON type array for tabel type array.
   * @param rows Table data. Array of values array.
   * @param fieldNames Column names
   */
  fromTable(rows: Array<any[]>, fieldNames: string[]): DataPipe {
    this.data = fromTable(rows, fieldNames);
    return this;
  }

  /**
   * Gets table data from JSON type array.
   * @param rowsFieldName
   * @param fieldsFieldName
   */
  toTable(rowsFieldName = 'rows', fieldsFieldName = 'fields'): {[key: string]: any} {
    return toTable(this.data, rowsFieldName, fieldsFieldName);
  }

  /**
   * Get unique values
   * @param elementSelector Function invoked per iteration.
   */
  unique(elementSelector?: Selector) {
    if (elementSelector) {
      this.select(elementSelector);
    }
    this.data = Array.from(new Set(this.data));
    return this;
  }
}
