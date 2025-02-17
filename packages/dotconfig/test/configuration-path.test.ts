import { expect, test, describe } from "bun:test";
import { combine, compare, getParentPath, getSectionKey } from "../src/configuration-path";

describe("ConfigurationPath", () => {
  describe("combine", () => {
    const combineCases: [string[], string][] = [
      [["parent", ""], "parent:"],
      [["parent", "", ""], "parent::"],
      [["parent", "", "", "key"], "parent:::key"],
    ];

    test.each(combineCases)("combine(%p) should return %p", (segments, expected) => {
      expect(combine(...segments)).toBe(expected);
    });
  });

  describe("getSectionKey", () => {
    const getSectionKeyCases: [string, string][] = [
      ["", ""],
      [":::", ""],
      ["a::b:::c", "c"],
      ["a:::b:", ""],
      ["key", "key"],
      [":key", "key"],
      ["::key", "key"],
      ["parent:key", "key"],
    ];

    test.each(getSectionKeyCases)("getSectionKey(%p) should return %p", (input, expected) => {
      expect(getSectionKey(input)).toBe(expected);
    });
  });

  describe("getParentPath", () => {
    const getParentPathCases: [string | null, string | null][] = [
      [null, null],
      ["", null],
      [":::", "::"],
      ["a::b:::c", "a::b::"],
      ["a:::b:", "a:::b"],
      ["key", null],
      [":key", ""],
      ["::key", ":"],
      ["parent:key", "parent"],
    ];

    test.each(getParentPathCases)("getParentPath(%p) should return %p", (input, expected) => {
      expect(getParentPath(input)).toBe(expected);
    });
  });
});

describe("Configuration path comparer", () => {
  const testCases: [string | null, string | null, number][] = [
    // Compare with null.
    [null, null, 0],
    [null, "a", -1],
    ["b", null, 1],
    [null, "a:b", -1],
    [null, "a:b:c", -1],

    // Compare with same length.
    ["a", "a", 0],
    ["a", "A", 0],
    ["aB", "Ab", 0],

    // Compare with different lengths.
    ["a", "aa", -1],
    ["aa", "a", 1],

    // Compare with empty.
    [":", "", 0],
    [":", "::", 0],
    [null, "", 0],
    [":", null, 0],
    ["::", null, 0],
    [" : : ", null, 1],
    ["b: :a", "b::a", -1],
    ["b:\t:a", "b::a", -1],
    ["b::a: ", "b::a:", 1],

    // Compare with letters.
    ["a", "b", -1],
    ["b", "a", 1],

    // Compare with numbers.
    ["000", "0", 0],
    ["001", "1", 0],
    ["1", "1", 0],
    ["1", "10", -1],
    ["10", "1", 1],
    ["2", "10", -1],
    ["10", "2", 1],

    // Compare with numbers and letters.
    ["1", "a", -1],
    ["a", "1", 1],
    ["100", "a", -1],
    ["a", "100", 1],

    // Compare with non numbers.
    ["1a", "100", 1],
    ["100", "1a", -1],
    ["100a", "100", 1],
    ["100", "100a", -1],
    ["a100", "100", 1],
    ["100", "a100", -1],
    ["1a", "a", -1],
    ["a", "1a", 1],

    // Compare identical paths.
    ["abc:DEF:0:a100", "ABC:DEF:0:a100", 0],

    // Compare different paths.
    ["abc:def", "ghi:2", -1],
    ["ghi:2", "abc:def", 1],

    // Compare paths with common part.
    ["abc:def:XYQ", "abc:def:XYZ", -1],
    ["abc:def:XYZ", "abc:def:XYQ", 1],

    // Compare paths with common part but shorter.
    ["abc:def", "abc:def:ghi", -1],
    ["abc:def:ghi", "abc:def", 1],

    // Compare paths with indices at the end.
    ["abc:def:2", "abc:def:10", -1],
    ["abc:def:10", "abc:def:2", 1],
    ["abc:def:10", "abc:def:22", -1],
    ["abc:def:22", "abc:def:10", 1],

    // Compare paths with indices inside.
    ["abc:def:1000:jkl", "abc:def:ghi:jkl", -1],
    ["abc:def:ghi:jkl", "abc:def:1000:jkl", 1],
    ["abc:def:10:jkl", "abc:def:22:jkl", -1],
    ["abc:def:22:jkl", "abc:def:10:jkl", 1],
  ];

  test.each(testCases)("compare(%p, %p) should return %p", (a, b, expectedSign) => {
    const result = compare(a, b);

    expect(Math.sign(result)).toBe(expectedSign);
  });
});
