import { trimStart, trimEnd } from "../string";


describe('string utils', () => {
  it('ltrim', () => {
    expect(trimStart('.net', '.')).toBe('net');
    expect(trimStart('...net', '.')).toBe('net');
    expect(trimStart('.+net', '.+')).toBe('net');
  });

  it('rtrim', () => {
    expect(trimEnd('net.', '.')).toBe('net');
    expect(trimEnd('net..', '.')).toBe('net');
    expect(trimEnd('net++', '.+')).toBe('net');
  });

})


