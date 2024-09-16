import { test, expect, describe } from "bun:test";
import { MemoryConfigurationSource } from "../src/providers/memory";
import { ConfigurationBuilder } from "../src/configuration-builder";
import { ChainedConfigurationProvider, ChainedConfigurationSource } from "../src/providers/chained-configuration";
import { iterateConfigurationEntries } from "../src/helpers";

test("Load and combine key value pairs from different configuration providers", async () => {
    const dic1 = new Map<string, string>([
        ["Mem1:KeyInMem1", "ValueInMem1"]
    ]);
    const dic2 = new Map<string, string>([
        ["Mem2:KeyInMem2", "ValueInMem2"]
    ]);
    const dic3 = new Map<string, string>([
        ["Mem3:KeyInMem3", "ValueInMem3"]
    ]);

    const memConfigSrc1 = new MemoryConfigurationSource(dic1);
    const memConfigSrc2 = new MemoryConfigurationSource(dic2);
    const memConfigSrc3 = new MemoryConfigurationSource(dic3);

    const configurationBuilder = new ConfigurationBuilder();

    // Act
    configurationBuilder.add(memConfigSrc1);
    configurationBuilder.add(memConfigSrc2);
    configurationBuilder.add(memConfigSrc3);

    const config = await configurationBuilder.build();

    const memVal1 = config.get("mem1:keyinmem1");
    const memVal2 = config.get("Mem2:KeyInMem2");
    const memVal3 = config.get("MEM3:KEYINMEM3");

    // Expect
    expect(configurationBuilder.sources).toContain(memConfigSrc1);
    expect(configurationBuilder.sources).toContain(memConfigSrc2);
    expect(configurationBuilder.sources).toContain(memConfigSrc3);

    expect(memVal1).toBe("ValueInMem1");
    expect(memVal2).toBe("ValueInMem2");
    expect(memVal3).toBe("ValueInMem3");

    expect(config.get("mem1:keyinmem1")).toBe("ValueInMem1");
    expect(config.get("Mem2:KeyInMem2")).toBe("ValueInMem2");
    expect(config.get("MEM3:KEYINMEM3")).toBe("ValueInMem3");
    expect(config.get("NotExist")).toBeNull();
});

describe("GetChildKeys", () => {
    test("Can chain empty keys", async () => {
        const input = new Map<string, string>();
        for (let i = 0; i < 1000; i++) {
            input.set(" ".repeat(i), "");
        }

        const configurationRoot = await new ConfigurationBuilder()
            .add(new MemoryConfigurationSource(input))
            .build();

        const chainedConfigurationSource = new ChainedConfigurationSource(configurationRoot);

        const chainedConfiguration = new ChainedConfigurationProvider(chainedConfigurationSource);
        const childKeys = chainedConfiguration.getChildKeys([]);

        expect(childKeys.length).toBe(1000);
        expect(childKeys[0]).toBe("");
    });

    test.skip("Can chain key with no delimiter", () => { });
});

test("Can chain configuration", async () => {
    // Arrange
    const dic1 = new Map<string, string>([
        ["Mem1:KeyInMem1", "ValueInMem1"]
    ]);
    const dic2 = new Map<string, string>([
        ["Mem2:KeyInMem2", "ValueInMem2"]
    ]);
    const dic3 = new Map<string, string>([
        ["Mem3:KeyInMem3", "ValueInMem3"]
    ]);

    const memConfigSrc1 = new MemoryConfigurationSource(dic1);
    const memConfigSrc2 = new MemoryConfigurationSource(dic2);
    const memConfigSrc3 = new MemoryConfigurationSource(dic3);

    const configurationBuilder = new ConfigurationBuilder();

    // Act
    configurationBuilder.add(memConfigSrc1);
    configurationBuilder.add(memConfigSrc2);
    configurationBuilder.add(memConfigSrc3);

    const config = await configurationBuilder.build();

    const chained = await new ConfigurationBuilder()
        .add(new ChainedConfigurationSource(config))
        .build();

    const memVal1 = chained.get("mem1:keyinmem1");
    const memVal2 = chained.get("Mem2:KeyInMem2");
    const memVal3 = chained.get("MEM3:KEYINMEM3");

    // Assert
    expect(memVal1).toBe("ValueInMem1");
    expect(memVal2).toBe("ValueInMem2");
    expect(memVal3).toBe("ValueInMem3");

    expect(chained.get("NotExist")).toBeNull();
});

test.each([true, false])("Chained getConfigurationEntries flattens into dictionary (removePath: %s)", async (removePath) => {
    // Arrange
    const dic1 = new Map([
        ["Mem1", "Value1"],
        ["Mem1:", "NoKeyValue1"],
        ["Mem1:KeyInMem1", "ValueInMem1"],
        ["Mem1:KeyInMem1:Deep1", "ValueDeep1"]
    ]);
    const dic2 = new Map([
        ["Mem2", "Value2"],
        ["Mem2:", "NoKeyValue2"],
        ["Mem2:KeyInMem2", "ValueInMem2"],
        ["Mem2:KeyInMem2:Deep2", "ValueDeep2"]
    ]);
    const dic3 = new Map([
        ["Mem3", "Value3"],
        ["Mem3:", "NoKeyValue3"],
        ["Mem3:KeyInMem3", "ValueInMem3"],
        ["Mem3:KeyInMem3:Deep3", "ValueDeep3"]
    ]);

    const memConfigSrc1 = new MemoryConfigurationSource(dic1);
    const memConfigSrc2 = new MemoryConfigurationSource(dic2);
    const memConfigSrc3 = new MemoryConfigurationSource(dic3);

    const configurationBuilder = new ConfigurationBuilder();

    // Act
    configurationBuilder.add(memConfigSrc1);
    configurationBuilder.add(memConfigSrc2);
    const config = await new ConfigurationBuilder()
        .add(new ChainedConfigurationSource(await configurationBuilder.build()))
        .add(memConfigSrc3)
        .build();

    const dict = Object.fromEntries(iterateConfigurationEntries(config, removePath));

    // Assert
    expect(dict).toMatchSnapshot();
});

test("New configuration provider overrides old one when key is duplicated", async () => {
    // Arrange
    const dic1 = new Map([
        ["Key1:Key2", "ValueInMem1"]
    ]);
    const dic2 = new Map([
        ["Key1:Key2", "ValueInMem2"]
    ]);

    const memConfigSrc1 = new MemoryConfigurationSource(dic1);
    const memConfigSrc2 = new MemoryConfigurationSource(dic2);

    const configurationBuilder = new ConfigurationBuilder();

    // Act
    configurationBuilder.add(memConfigSrc1);
    configurationBuilder.add(memConfigSrc2);

    const config = await configurationBuilder.build();

    // Assert
    expect(config.get("Key1:Key2")).toBe("ValueInMem2");
});
