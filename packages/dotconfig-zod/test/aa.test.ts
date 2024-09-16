import { expect, test } from "bun:test";
import { z } from "zod";

const testSchema = z.object({
    test: z.string(),
});

test("Test", () => {
    const a = new Proxy({}, {
        get(target, p, receiver) {
            if (p === "test") {
                return "test";
            }
            return Reflect.get(target, p, receiver);
        }
    });

    const result = testSchema.parse(a);

    expect(1).toBe(1);
});