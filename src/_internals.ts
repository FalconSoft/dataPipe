import { Selector } from './types';
import { dateToString } from './utils';

export function fieldSelector<T = unknown>(
  input: string | string[] | Selector<T, string>
): Selector<T, string> {
  if (typeof input === 'function') {
    return (item: T): string => {
      const value = input(item) as unknown;
      return value instanceof Date ? dateToString(value as Date) : String(value);
    };
  } else if (typeof input === 'string') {
    return (item: T): string => {
      const value = (item as Record<string, unknown>)[input];
      return value instanceof Date ? dateToString(value) : String(value);
    };
  } else if (Array.isArray(input)) {
    return (item: T): string => input.map(r => (item as Record<string, unknown>)[r]).join('|');
  } else {
    throw Error(`Unknown input. Can't create a fieldSelector`);
  }
}
