/* eslint-disable no-useless-escape */
import { JSONParser } from '../utils';

describe('Json Parser specification', () => {
  function jsonProcessor(text: string): any[] {
    const result: any[] = [];
    const parser = new JSONParser();
    for (const ch of text) {
      parser.processJsonItems(ch, (itemText: string, key: string | number) => {
        let item = JSON.parse(itemText);

        if (typeof key === 'string') {
          item = { key, item };
        }

        result.push(item);
      });
    }

    return result;
  }

  it('Simple JSON', () => {
    const result = jsonProcessor('[{"value":"test value"},{"value":2},{"value":3}]');

    expect(result.length).toBe(3);
    expect(result[0].value).toBe('test value');
    expect(result[1].value).toBe(2);
  });

  // it('Simple JSV', () => {
  //   const result = JSONParser.parseJson('[{value:test value},{value:2},{value:3}]');

  //   expect(result.length).toBe(3);
  //   expect(result[0].value).toBe('test value');
  //   expect(result[1].value).toBe(2);
  // });

  it('JSV with space', () => {
    const result = jsonProcessor('[{"value":"test"},{"value":2, "value1": 21},{"value":3}]');

    expect(result.length).toBe(3);
    expect(result[1].value1).toBe(21);
  });

  it('json inner object', () => {
    const result = jsonProcessor(
      '[{"v":"test", "obj":{"v1":2, "v2": 21},"value":3}, {"v":"test2", "obj":{"v1":22, "v2": 212},"value":32}]'
    );

    expect(result.length).toBe(2);
    expect(result[1].obj.v2).toBe(212);
  });

  it('JSON simple array', () => {
    const result = jsonProcessor('[{"v":"test", "arr":[{"v1":1}, {"v1":2}]}]');

    expect(result.length).toBe(1);
    expect(result[0].arr[1].v1).toBe(2);
  });

  
  // it('Simple JSON with " to escape', () => {
  //   const result = jsonProcessor('[{"value":"test "value"}]');

  //   expect(result.length).toBe(3);
  //   expect(result[0].value).toBe('test "value');
  //   expect(result[1].value).toBe(2);
  // });

  //
});
