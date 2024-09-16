"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const flatten_js_1 = require("../../src/utils/flatten.js");
(0, bun_test_1.test)("Flattens empty nested keys.", () => {
    const input = {
        "": {
            "": {
                "": 1,
            },
        }
    };
    (0, bun_test_1.expect)((0, flatten_js_1.flatten)(input)).toMatchSnapshot();
});
(0, bun_test_1.test)("Flattens a simple object.", () => {
    const input = { a: 1, b: { c: 2 }, d: [3, 4] };
    const expected = new Map([
        ["a", 1],
        ["b.c", 2],
        ["d.0", 3],
        ["d.1", 4],
    ]);
    (0, bun_test_1.expect)((0, flatten_js_1.flatten)(input)).toEqual(expected);
});
(0, bun_test_1.test)("Handles nested objects.", () => {
    const input = { a: { b: { c: { d: 1 } } } };
    const expected = new Map([["a.b.c.d", 1]]);
    (0, bun_test_1.expect)((0, flatten_js_1.flatten)(input)).toEqual(expected);
});
(0, bun_test_1.test)("Uses custom delimiter.", () => {
    const input = { a: { b: 1 }, c: { d: 2 } };
    const expected = new Map([
        ["a/b", 1],
        ["c/d", 2],
    ]);
    (0, bun_test_1.expect)((0, flatten_js_1.flatten)(input, { delimiter: "/" })).toEqual(expected);
});
(0, bun_test_1.test)("Handles arrays.", () => {
    const input = { a: [1, 2, [3, 4]] };
    const expected = new Map([
        ["a.0", 1],
        ["a.1", 2],
        ["a.2.0", 3],
        ["a.2.1", 4],
    ]);
    (0, bun_test_1.expect)((0, flatten_js_1.flatten)(input)).toEqual(expected);
});
(0, bun_test_1.test)("Handles null and undefined values.", () => {
    const input = { a: null, b: undefined, c: { d: null } };
    const expected = new Map([
        ["a", null],
        ["b", undefined],
        ["c.d", null],
    ]);
    (0, bun_test_1.expect)((0, flatten_js_1.flatten)(input)).toEqual(expected);
});
(0, bun_test_1.test)("Uses custom key transformer.", () => {
    const input = { FOO: { BAR: 1 } };
    const expected = new Map([["foo_bar", 1]]);
    const transformKey = (key) => key.toLowerCase();
    (0, bun_test_1.expect)((0, flatten_js_1.flatten)(input, { transformKey, delimiter: "_" })).toEqual(expected);
});
(0, bun_test_1.test)("Handles circular references.", () => {
    // biome-ignore lint/suspicious/noExplicitAny: Test case.
    const input = { a: 1 };
    input.b = input;
    (0, bun_test_1.expect)(() => (0, flatten_js_1.flatten)(input)).toThrow(new flatten_js_1.CircularReferenceError("b.b"));
});
//# sourceMappingURL=flatten.test.js.map