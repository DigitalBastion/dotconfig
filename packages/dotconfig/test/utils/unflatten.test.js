"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const flatten_js_1 = require("../../src/utils/flatten.js");
(0, bun_test_1.test)("It should unflatten a simple Map.", () => {
    const input = new Map([
        ["a.b.c", 1],
        ["a.b.d", 2],
    ]);
    const expected = { a: { b: { c: 1, d: 2 } } };
    (0, bun_test_1.expect)((0, flatten_js_1.unflatten)(input)).toEqual(expected);
});
(0, bun_test_1.test)("It should handle numeric keys as array indices.", () => {
    const input = new Map([
        ["a.0", "foo"],
        ["a.1", "bar"],
    ]);
    const expected = { a: ["foo", "bar"] };
    (0, bun_test_1.expect)((0, flatten_js_1.unflatten)(input)).toEqual(expected);
});
(0, bun_test_1.test)("It should use a custom delimiter.", () => {
    const input = new Map([
        ["a|b|c", 1],
        ["a|b|d", 2],
    ]);
    const expected = { a: { b: { c: 1, d: 2 } } };
    (0, bun_test_1.expect)((0, flatten_js_1.unflatten)(input, { delimiter: "|" })).toEqual(expected);
});
(0, bun_test_1.test)("It should transform keys using a custom function.", () => {
    const input = new Map([
        ["a.b.c", 1],
        ["a.b.d", 2],
    ]);
    const expected = { A: { B: { C: 1, D: 2 } } };
    const transformKey = (key) => key.toUpperCase();
    (0, bun_test_1.expect)((0, flatten_js_1.unflatten)(input, { transformKey })).toEqual(expected);
});
(0, bun_test_1.test)("It should handle empty objects and arrays correctly.", () => {
    const input = new Map([
        ["a.b", {}],
        ["c.0", []],
        ["d.e.f", 1],
    ]);
    const expected = { a: { b: {} }, c: [[]], d: { e: { f: 1 } } };
    (0, bun_test_1.expect)((0, flatten_js_1.unflatten)(input)).toEqual(expected);
});
(0, bun_test_1.test)("It should override empty objects with non-empty ones.", () => {
    const input = new Map([
        ["a", {}],
        ["a.b.c", 1],
    ]);
    const expected = { a: { b: { c: 1 } } };
    (0, bun_test_1.expect)((0, flatten_js_1.unflatten)(input)).toEqual(expected);
});
(0, bun_test_1.test)("It should handle deeply nested objects.", () => {
    const input = new Map([["a.b.c.d.e.f.g", 1]]);
    const expected = { a: { b: { c: { d: { e: { f: { g: 1 } } } } } } };
    (0, bun_test_1.expect)((0, flatten_js_1.unflatten)(input)).toEqual(expected);
});
(0, bun_test_1.test)("It should correctly unflatten mixed objects and arrays.", () => {
    const input = new Map([
        ["a.0.b", 1],
        ["a.1.c", 2],
        ["d.e", 3],
    ]);
    const expected = { a: [{ b: 1 }, { c: 2 }], d: { e: 3 } };
    (0, bun_test_1.expect)((0, flatten_js_1.unflatten)(input)).toEqual(expected);
});
(0, bun_test_1.test)("It should return an empty object for an empty Map.", () => {
    const input = new Map();
    const expected = {};
    (0, bun_test_1.expect)((0, flatten_js_1.unflatten)(input)).toEqual(expected);
});
//# sourceMappingURL=unflatten.test.js.map