import { trimStart, trimEnd, split } from "../string";

describe("string utils", () => {
  it("ltrim", () => {
    expect(trimStart(".net", ".")).toBe("net");
    expect(trimStart("...net", ".")).toBe("net");
    expect(trimStart(".+net", ".+")).toBe("net");
  });

  it("rtrim", () => {
    expect(trimEnd("net.", ".")).toBe("net");
    expect(trimEnd("net..", ".")).toBe("net");
    expect(trimEnd("net++", ".+")).toBe("net");
  });
});

describe("string split", () => {
  it("split => simple", () => {
    const t = split("a,b", ",");
    expect(t.length).toBe(2);
    expect(t[0]).toBe("a");
    expect(t[1]).toBe("b");
  });

  it("split => simple2", () => {
    const t = split("a2,b2", ",");
    expect(t.length).toBe(2);
    expect(t[0]).toBe("a2");
    expect(t[1]).toBe("b2");
  });

  it("split => with brackets 1", () => {
    const t = split("a(s,d)t,b2", ",", ["()"]);
    expect(t.length).toBe(2);
    expect(t[0]).toBe("a(s,d)t");
    expect(t[1]).toBe("b2");
  });

  it("split => with brackets 2", () => {
    const t = split("a(s,d),b2", ",", ["()"]);
    expect(t.length).toBe(2);
    expect(t[0]).toBe("a(s,d)");
    expect(t[1]).toBe("b2");
  });

  it("split => with brackets 3", () => {
    const t = split("a(s,ff(e,r)d),b2", ",", ["()"]);
    expect(t.length).toBe(2);
    expect(t[0]).toBe("a(s,ff(e,r)d)");
    expect(t[1]).toBe("b2");
  });

  it("split => with brackets 4", () => {
    const t = split("a(s,ff(e,r)d),b2ff(e,r)", ",", ["()"]);
    expect(t.length).toBe(2);
    expect(t[0]).toBe("a(s,ff(e,r)d)");
    expect(t[1]).toBe("b2ff(e,r)");
  });
});
