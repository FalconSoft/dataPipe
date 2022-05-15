import { trim } from '../string';

function setValue(obj: Record<string, any> | any[], key: string, value: any): void {
  if (typeof value !== 'object') {
    const strValue = trim(value, `"'`);
    value = isNaN(+strValue) ? strValue : +strValue;
  }

  if (Array.isArray(obj)) {
    obj.push(value);
  } else {
    obj[trim(key, `"' `)] = value;
  }
}

function iterateTo(iterator: Iterator<string>, searchChar: string): string {
  let item: IteratorResult<string, string>;
  let token = '';
  while (((item = iterator.next()), !item.done)) {
    const ch = item.value;
    if (searchChar.indexOf(ch) >= 0) {
      break;
    }
    token += ch;
  }

  return token;
}

function parseObject(iterator: Iterator<string>, isArray = false): Record<string, any> {
  let item: IteratorResult<string, string>;
  let token = '';
  let key = '';
  const result: Record<string, any> | any = isArray ? [] : {};

  const closeSymbol = isArray ? ']' : '}';

  while (((item = iterator.next()), !item.done)) {
    const ch = item.value;

    if (ch === closeSymbol) {
      break;
    }
    if (ch === ':') {
      key = token;
      token = '';
    } else if (ch === ',') {
      if (token?.trim()?.length) {
        setValue(result, key, token);
      }
      token = '';
    } else if (ch === '{') {
      const v = parseObject(iterator);
      setValue(result, key, v);
    } else if (ch === '[') {
      const v = parseObject(iterator, true);
      setValue(result, key, v);
    } else {
      token += ch;
    }
  }

  if (token?.trim()?.length) {
    setValue(result, key, token);
  }

  return result;
}

export function* jsonParseIterator(iterable: Iterable<string>): Iterable<any> {
  const iterator: Iterator<string> = iterable[Symbol.iterator]();
  let item: IteratorResult<string, string>;

  let firstItem = '';
  while (((item = iterator.next()), !item.done)) {
    const ch = item.value;
    if (!firstItem && ch.trim()) {
      firstItem = ch;
      break;
    }
  }

  if (firstItem === '[') {
    while (((item = iterator.next()), !item.done)) {
      const ch = item.value;
      if (ch === '{' || ch === '[') {
        const obj = parseObject(iterator);
        yield obj;
      } else if (ch === ',') {
        continue;
      }
    }
  } else if (firstItem === '{') {
    let __key = '';
    while (((item = iterator.next()), !item.done)) {
      __key = item.value;
      __key = __key + iterateTo(iterator, ':');
      iterateTo(iterator, '{[');
      const __value = parseObject(iterator);

      yield { __key, __value };

      iterateTo(iterator, ',')
    }
  }
}
