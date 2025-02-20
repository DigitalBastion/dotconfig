import { expect, test } from "bun:test";
import { CircularReferenceError, flatten } from "../../src/utils.js";

test("Flattens empty nested keys.", () => {
  const input = {
    "": {
      "": {
        "": 1,
      },
    },
  };
  expect(flatten(input)).toMatchSnapshot();
});

test("Flattens a simple object.", () => {
  const input = { a: 1, b: { c: 2 }, d: [3, 4] };
  const expected = new Map([
    ["a", 1],
    ["b.c", 2],
    ["d.0", 3],
    ["d.1", 4],
  ]);
  expect(flatten(input)).toEqual(expected);
});

test("Handles nested objects.", () => {
  const input = { a: { b: { c: { d: 1 } } } };
  const expected = new Map([["a.b.c.d", 1]]);
  expect(flatten(input)).toEqual(expected);
});

test("Uses custom delimiter.", () => {
  const input = { a: { b: 1 }, c: { d: 2 } };
  const expected = new Map([
    ["a/b", 1],
    ["c/d", 2],
  ]);
  expect(flatten(input, { delimiter: "/" })).toEqual(expected);
});

test("Handles arrays.", () => {
  const input = { a: [1, 2, [3, 4]] };
  const expected = new Map([
    ["a.0", 1],
    ["a.1", 2],
    ["a.2.0", 3],
    ["a.2.1", 4],
  ]);
  expect(flatten(input)).toEqual(expected);
});

test("Handles null and undefined values.", () => {
  const input = { a: null, b: undefined, c: { d: null } };
  const expected = new Map([
    ["a", null],
    ["b", undefined],
    ["c.d", null],
  ]);
  expect(flatten(input)).toEqual(expected);
});

test("Uses custom key transformer.", () => {
  const input = { FOO: { BAR: 1 } };
  const expected = new Map([["foo_bar", 1]]);
  const transformKey = (key: string) => key.toLowerCase();
  expect(flatten(input, { transformKey, delimiter: "_" })).toEqual(expected);
});

test("Handles circular references.", () => {
  // biome-ignore lint/suspicious/noExplicitAny: Test case.
  const input = { a: 1 } as any;
  input.b = input;

  expect(() => flatten(input)).toThrow(new CircularReferenceError("b.b"));
});
