import { trim } from '../string';

export class JSONParser {
  private readonly whitespaces = ' \n\r\t';
  private ignoreWhiteSpace = false;
  private token = '';
  private openObjectCount = 0;
  private openArrayCount = 0;
  private count = 0;

  processFirstLevel(
    ch: string,
    processCallback: (obj: string, key: string | number) => void
  ): void {
    if (this.ignoreWhiteSpace && this.whitespaces.indexOf(ch) >= 0) {
      return;
    }

    if (ch === '{') {
      this.openObjectCount++;
    } else if (ch === '}') {
      this.openObjectCount--;
    } else if (ch === '[') {
      this.openArrayCount++;
    } else if (ch === ']') {
      this.openArrayCount--;
    }

    const objectDone = this.openArrayCount === 0 && this.openObjectCount === 0;

    if (objectDone && ch === ',') {
      return;
    }

    this.token += ch;

    if (objectDone && this.token.trim()) {
      processCallback(this.token, this.count++);
      this.token = '';
    }
  }

  static parseJson(text: string): any {
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
    if(text.trim()[0] === '{'){
      const iter = text[Symbol.iterator]();
        
      iterateTo(iter, '{[');
      return JSONParser.parseObject(iter, false);
    }

    const parser = new JSONParser();

    let result: any = null;
    let firstChar = '';

    for (const ch of text) {
      if (!firstChar) {
        firstChar = ch;
        result = ch === '[' ? [] : Object.create(null);
        continue;
      }
      parser.processFirstLevel(ch, (itemString, key) => {
        const iter = itemString[Symbol.iterator]();
        
        iterateTo(iter, '{[').trim();
        const f = itemString.trim()[0];
        const item = JSONParser.parseObject(iter, f === '[');
        if (Array.isArray(result)) {
          result.push(item);
        } else {
          result[key] = item;
        }
      });
    }

    return result;
  }

  private static parseObject(iterator: Iterator<string>, isArray = false): Record<string, any> {
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

    let item: IteratorResult<string, string>;
    let token = '';
    let key = '';
    const result: Record<string, any> | any = isArray ? [] : Object.create(null);

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
        const v = this.parseObject(iterator);
        setValue(result, key, v);
      } else if (ch === '[') {
        const v = this.parseObject(iterator, true);
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

}
