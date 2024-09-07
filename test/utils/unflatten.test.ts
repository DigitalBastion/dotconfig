import { expect, test } from "bun:test";
import { unflatten } from "../../src/utils/flatten.js";

test("It should unflatten a simple Map.", () => {
  const input = new Map([
    ["a.b.c", 1],
    ["a.b.d", 2],
  ]);
  const expected = { a: { b: { c: 1, d: 2 } } };
  expect(unflatten(input)).toEqual(expected);
});

test("It should handle numeric keys as array indices.", () => {
  const input = new Map([
    ["a.0", "foo"],
    ["a.1", "bar"],
  ]);
  const expected = { a: ["foo", "bar"] };
  expect(unflatten(input)).toEqual(expected);
});

test("It should use a custom delimiter.", () => {
  const input = new Map([
    ["a|b|c", 1],
    ["a|b|d", 2],
  ]);
  const expected = { a: { b: { c: 1, d: 2 } } };
  expect(unflatten(input, { delimiter: "|" })).toEqual(expected);
});

test("It should transform keys using a custom function.", () => {
  const input = new Map([
    ["a.b.c", 1],
    ["a.b.d", 2],
  ]);
  const expected = { A: { B: { C: 1, D: 2 } } };
  const transformKey = (key: string) => key.toUpperCase();
  expect(unflatten(input, { transformKey })).toEqual(expected);
});

test("It should handle empty objects and arrays correctly.", () => {
  const input = new Map<string, unknown>([
    ["a.b", {}],
    ["c.0", []],
    ["d.e.f", 1],
  ]);
  const expected = { a: { b: {} }, c: [[]], d: { e: { f: 1 } } };
  expect(unflatten(input)).toEqual(expected);
});

test("It should override empty objects with non-empty ones.", () => {
  const input = new Map<string, unknown>([
    ["a", {}],
    ["a.b.c", 1],
  ]);
  const expected = { a: { b: { c: 1 } } };
  expect(unflatten(input)).toEqual(expected);
});

test("It should handle deeply nested objects.", () => {
  const input = new Map([["a.b.c.d.e.f.g", 1]]);
  const expected = { a: { b: { c: { d: { e: { f: { g: 1 } } } } } } };
  expect(unflatten(input)).toEqual(expected);
});

test("It should correctly unflatten mixed objects and arrays.", () => {
  const input = new Map([
    ["a.0.b", 1],
    ["a.1.c", 2],
    ["d.e", 3],
  ]);
  const expected = { a: [{ b: 1 }, { c: 2 }], d: { e: 3 } };
  expect(unflatten(input)).toEqual(expected);
});

test("It should return an empty object for an empty Map.", () => {
  const input = new Map();
  const expected = {};
  expect(unflatten(input)).toEqual(expected);
});
