import { test, expect } from "bun:test";
import { z } from "zod";
import { ConfigurationBuilder } from "dotconfig";
import { MemoryConfigurationSource } from "dotconfig/providers/memory.js";

import { parseConfiguration } from "../src/index.js";

test("ConfigurationBuilder", async () => {
    const configuration = await new ConfigurationBuilder()
        .add(new MemoryConfigurationSource(new Map<string, string>([
            ["a:b:c", "1"],
        ])))
        .build();

    const schema = z.object({
        a: z.object({
            b: z.object({
                c: z.coerce.number(),
            }),
        }),
    });

    const result = parseConfiguration(schema, configuration);
    expect(result).toEqual({ a: { b: { c: 1 } } });
});
