import { trim } from '../string';

export class JSONParser {
  private readonly whitespaces = ' \n\r\t';
  private ignoreWhiteSpace = false;
  private token = '';
  private openObjectCount = 0;
  private openArrayCount = 0;
  private count = 0;
  private firstChar = '';

  private isString = false;
  private isKeyCollector = false;
  private prevChar = '';
  private itemKey = '';
  private isObjectMap = false;

  processJsonItems(ch: string, processCallback: (obj: string, key: string | number) => void): void {
    if (!this.firstChar) {
      // ignore begining whitespaces
      if (!ch.trim().length) {
        return;
      }
      this.firstChar = ch;
      if (this.firstChar === '{') {
        this.isKeyCollector = true;
        this.isObjectMap = true;
      }
      return;
    }

    if (this.ignoreWhiteSpace && this.whitespaces.indexOf(ch) >= 0) {
      return;
    }

    if (!this.isString && ch === '{') {
      this.openObjectCount++;
    } else if (!this.isString && ch === '}') {
      this.openObjectCount--;
    } else if (!this.isString && ch === '[') {
      this.openArrayCount++;
    } else if (!this.isString && ch === ']') {
      this.openArrayCount--;
    } else if (!this.isString && this.isKeyCollector && ch === ':') {
      this.itemKey = this.token;
      this.token = '';
      this.isKeyCollector = false;
      return;
    } else if (ch === '"' && (this.prevChar !== '\\' || this.token.endsWith('\\\\'))) {
      this.isString = !this.isString;
    }

    const objectDone =
      !this.isKeyCollector && this.openArrayCount === 0 && this.openObjectCount === 0;

    if (objectDone && ch === ',') {
      return;
    }

    this.token += ch;
    this.prevChar = ch;

    if (objectDone && this.token.trim()) {
      const key = this.itemKey ? trim(this.itemKey, `\n\t ,"'`) : this.count;
      processCallback(this.token, key);

      if (this.isObjectMap) {
        this.isKeyCollector = true;
      }

      this.count++;
      this.itemKey = '';
      this.token = '';
    }
  }
}
