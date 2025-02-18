import { test, expect, describe } from "bun:test";
import { MemoryConfigurationProvider, MemoryConfigurationSource } from "../src/providers/memory";
import { ConfigurationBuilder } from "../src/configuration-builder";
import { ChainedConfigurationProvider, ChainedConfigurationSource } from "../src/providers/chained-configuration";
import { iterateConfigurationEntries } from "../src/helpers";
import type {
  IChangeToken,
  IConfigurationBuilder,
  IConfigurationProvider,
  IConfigurationSource,
} from "../src/abstractions";

test("Load and combine key value pairs from different configuration providers", async () => {
  const dic1 = new Map<string, string>([["Mem1:KeyInMem1", "ValueInMem1"]]);
  const dic2 = new Map<string, string>([["Mem2:KeyInMem2", "ValueInMem2"]]);
  const dic3 = new Map<string, string>([["Mem3:KeyInMem3", "ValueInMem3"]]);

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

    const configurationRoot = await new ConfigurationBuilder().add(new MemoryConfigurationSource(input)).build();

    const chainedConfigurationSource = new ChainedConfigurationSource(configurationRoot);

    const chainedConfiguration = new ChainedConfigurationProvider(chainedConfigurationSource);
    const childKeys = chainedConfiguration.getChildKeys([]);

    expect(childKeys.length).toBe(1000);
    expect(childKeys[0]).toBe("");
  });

  test("Can chain key with no delimiter", async () => {
    const input = new Map<string, string>();
    for (let i = 1000; i < 2000; i++) {
      input.set(i.toString(), "");
    }

    const configurationRoot = await new ConfigurationBuilder().add(new MemoryConfigurationSource(input)).build();

    const chainedConfigurationSource = new ChainedConfigurationSource(configurationRoot);

    const chainedConfiguration = new ChainedConfigurationProvider(chainedConfigurationSource);
    const childKeys = chainedConfiguration.getChildKeys([]);

    expect(childKeys.length).toBe(1000);
    expect(childKeys[0]).toBe("1000");
    expect(childKeys[999]).toBe("1999");
  });
});

test("Can chain configuration", async () => {
  // Arrange
  const dic1 = new Map<string, string>([["Mem1:KeyInMem1", "ValueInMem1"]]);
  const dic2 = new Map<string, string>([["Mem2:KeyInMem2", "ValueInMem2"]]);
  const dic3 = new Map<string, string>([["Mem3:KeyInMem3", "ValueInMem3"]]);

  const memConfigSrc1 = new MemoryConfigurationSource(dic1);
  const memConfigSrc2 = new MemoryConfigurationSource(dic2);
  const memConfigSrc3 = new MemoryConfigurationSource(dic3);

  const configurationBuilder = new ConfigurationBuilder();

  // Act
  configurationBuilder.add(memConfigSrc1);
  configurationBuilder.add(memConfigSrc2);
  configurationBuilder.add(memConfigSrc3);

  const config = await configurationBuilder.build();

  const chained = await new ConfigurationBuilder().add(new ChainedConfigurationSource(config)).build();

  const memVal1 = chained.get("mem1:keyinmem1");
  const memVal2 = chained.get("Mem2:KeyInMem2");
  const memVal3 = chained.get("MEM3:KEYINMEM3");

  // Assert
  expect(memVal1).toBe("ValueInMem1");
  expect(memVal2).toBe("ValueInMem2");
  expect(memVal3).toBe("ValueInMem3");

  expect(chained.get("NotExist")).toBeNull();
});

test.each([true, false])(
  "Chained getConfigurationEntries flattens into dictionary (removePath: %s)",
  async (removePath) => {
    // Arrange
    const dic1 = new Map([
      ["Mem1", "Value1"],
      ["Mem1:", "NoKeyValue1"],
      ["Mem1:KeyInMem1", "ValueInMem1"],
      ["Mem1:KeyInMem1:Deep1", "ValueDeep1"],
    ]);
    const dic2 = new Map([
      ["Mem2", "Value2"],
      ["Mem2:", "NoKeyValue2"],
      ["Mem2:KeyInMem2", "ValueInMem2"],
      ["Mem2:KeyInMem2:Deep2", "ValueDeep2"],
    ]);
    const dic3 = new Map([
      ["Mem3", "Value3"],
      ["Mem3:", "NoKeyValue3"],
      ["Mem3:KeyInMem3", "ValueInMem3"],
      ["Mem3:KeyInMem3:Deep3", "ValueDeep3"],
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
  },
);

test("New configuration provider overrides old one when key is duplicated", async () => {
  // Arrange
  const dic1 = new Map([["Key1:Key2", "ValueInMem1"]]);
  const dic2 = new Map([["Key1:Key2", "ValueInMem2"]]);

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

test("New configuration root may be built from existing with duplicate keys", async () => {
  const configurationRoot = await new ConfigurationBuilder()
    .addMemoryCollection(new Map([["keya:keyb", "valueA"]]))
    .addMemoryCollection(new Map([["KEYA:KEYB", "valueB"]]))
    .build();

  const newConfigurationRoot = await new ConfigurationBuilder().addMemoryCollection(new Map(configurationRoot)).build();

  expect(newConfigurationRoot.get("keya:keyb")).toBe("valueB");
});

class TestMemorySourceProvider extends MemoryConfigurationProvider implements IConfigurationSource {
  constructor(config: Map<string, string | null>) {
    super(new MemoryConfigurationSource(config));
  }

  public async build(builder: IConfigurationBuilder) {
    return this;
  }
}

test("Setting value updates all configuration providers", async () => {
  const dict = new Map<string, string | null>([
    ["Key1", "Value1"],
    ["Key2", "Value2"],
  ]);

  const memConfigSrc1 = new TestMemorySourceProvider(dict);
  const memConfigSrc2 = new TestMemorySourceProvider(dict);
  const memConfigSrc3 = new TestMemorySourceProvider(dict);

  const configurationBuilder = new ConfigurationBuilder();

  configurationBuilder.add(memConfigSrc1);
  configurationBuilder.add(memConfigSrc2);
  configurationBuilder.add(memConfigSrc3);

  const config = await configurationBuilder.build();

  // Act
  config.set("Key1", "NewValue1");
  config.set("Key2", "NewValue2");

  const memConfigProvider1 = await memConfigSrc1.build(configurationBuilder);
  const memConfigProvider2 = await memConfigSrc2.build(configurationBuilder);
  const memConfigProvider3 = await memConfigSrc3.build(configurationBuilder);

  // Assert
  expect(config.get("Key1")).toBe("NewValue1");
  expect(memConfigProvider1.get("Key1")).toBe("NewValue1");
  expect(memConfigProvider2.get("Key1")).toBe("NewValue1");
  expect(memConfigProvider3.get("Key1")).toBe("NewValue1");
  expect(config.get("Key2")).toBe("NewValue2");
  expect(memConfigProvider1.get("Key2")).toBe("NewValue2");
  expect(memConfigProvider2.get("Key2")).toBe("NewValue2");
  expect(memConfigProvider3.get("Key2")).toBe("NewValue2");
});

test("Can get configuration section", async () => {
  // Arrange
  const dic1 = new Map<string, string>([
    ["Data:DB1:Connection1", "MemVal1"],
    ["Data:DB1:Connection2", "MemVal2"],
  ]);
  const dic2 = new Map<string, string>([["DataSource:DB2:Connection", "MemVal3"]]);
  const dic3 = new Map<string, string>([["Data", "MemVal4"]]);

  const memConfigSrc1 = new MemoryConfigurationSource(dic1);
  const memConfigSrc2 = new MemoryConfigurationSource(dic2);
  const memConfigSrc3 = new MemoryConfigurationSource(dic3);

  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.add(memConfigSrc1);
  configurationBuilder.add(memConfigSrc2);
  configurationBuilder.add(memConfigSrc3);

  const config = await configurationBuilder.build();

  // Act
  const configFocus = config.getSection("Data");
  const memVal1 = configFocus.get("DB1:Connection1");
  const memVal2 = configFocus.get("DB1:Connection2");
  const memVal5 = configFocus.value;

  // Assert
  expect(memVal1).toBe("MemVal1");
  expect(memVal2).toBe("MemVal2");
  expect(memVal5).toBe("MemVal4");
  expect(configFocus.get("DB1:Connection1")).toBe("MemVal1");
  expect(configFocus.get("DB1:Connection2")).toBe("MemVal2");
  expect(configFocus.get("DB2:Connection")).toBeNull();
  expect(configFocus.get("Source:DB2:Connection")).toBeNull();
  expect(configFocus.value).toBe("MemVal4");
});

test("Can get configuration children", async () => {
  // Arrange
  const dic1 = new Map<string, string>([
    ["Data:DB1:Connection1", "MemVal1"],
    ["Data:DB1:Connection2", "MemVal2"],
  ]);

  const dic2 = new Map<string, string>([["Data:DB2Connection", "MemVal3"]]);
  const dic3 = new Map<string, string>([["DataSource:DB3:Connection", "MemVal4"]]);

  const memConfigSrc1 = new MemoryConfigurationSource(dic1);
  const memConfigSrc2 = new MemoryConfigurationSource(dic2);
  const memConfigSrc3 = new MemoryConfigurationSource(dic3);

  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.add(memConfigSrc1);
  configurationBuilder.add(memConfigSrc2);
  configurationBuilder.add(memConfigSrc3);

  const config = await configurationBuilder.build();

  // Act
  const configSections = config.getSection("Data").getChildren();

  // Assert
  expect(configSections.length).toBe(2);
  expect(configSections.find((x) => x.key === "DB1")?.get("Connection1")).toBe("MemVal1");
  expect(configSections.find((x) => x.key === "DB1")?.get("Connection2")).toBe("MemVal2");
  expect(configSections.find((x) => x.key === "DB2Connection")?.value).toBe("MemVal3");
  expect(configSections.some((c) => c.key === "DB3")).toBeFalsy();
});

test("Sources returns added configuration providers", async () => {
  // Arrange
  const dict = new Map<string, string>([["Mem:KeyInMem", "MemVal"]]);

  const memConfigSrc1 = new MemoryConfigurationSource(dict);
  const memConfigSrc2 = new MemoryConfigurationSource(dict);
  const memConfigSrc3 = new MemoryConfigurationSource(dict);

  const configurationBuilder = new ConfigurationBuilder();

  const srcSet = [memConfigSrc1, memConfigSrc2, memConfigSrc3];

  // Act
  configurationBuilder.add(memConfigSrc1);
  configurationBuilder.add(memConfigSrc2);
  configurationBuilder.add(memConfigSrc3);

  // Assert
  expect(configurationBuilder.sources).toEqual(srcSet);
});

test("Set value throws exception no source registered", async () => {
  // Arrange
  const configurationBuilder = new ConfigurationBuilder();
  const config = await configurationBuilder.build();

  // Act
  const act = () => config.set("Key", "Value");

  // Assert
  expect(act).toThrowError("No providers are available.");
});

test("Same reload token is returned repeatedly", async () => {
  // Arrange
  const configurationBuilder = new ConfigurationBuilder();
  const config = await configurationBuilder.build();

  // Act
  const token1 = config.getReloadToken();
  const token2 = config.getReloadToken();

  // Assert
  expect(token1).toBe(token2);
});

test("Different reload token returned after reloading", async () => {
  // Arrange
  const configurationBuilder = new ConfigurationBuilder();
  const config = await configurationBuilder.build();

  // Act
  const token1 = config.getReloadToken();
  const token2 = config.getReloadToken();
  config.reload();
  const token3 = config.getReloadToken();
  const token4 = config.getReloadToken();

  // Assert
  expect(token1).toBe(token2);
  expect(token3).toBe(token4);
  expect(token1).not.toBe(token3);
});

test("Token triggered when reload occurs", async () => {
  // Arrange
  const configurationBuilder = new ConfigurationBuilder();
  const config = await configurationBuilder.build();

  // Act
  const token1 = config.getReloadToken();
  const hasChanged1 = token1.hasChanged;
  config.reload();
  const hasChanged2 = token1.hasChanged;

  // Assert
  expect(hasChanged1).toBe(false);
  expect(hasChanged2).toBe(true);
});

test("Multiple callbacks can be registered to reload", async () => {
  // Arrange
  const configurationBuilder = new ConfigurationBuilder();
  const config = await configurationBuilder.build();

  // Act
  const token1 = config.getReloadToken();
  let called1 = 0;
  token1.registerChangeCallback(() => called1++);
  let called2 = 0;
  token1.registerChangeCallback(() => called2++);

  // Assert
  expect(called1).toBe(0);
  expect(called2).toBe(0);

  config.reload();
  expect(called1).toBe(1);
  expect(called2).toBe(1);

  const token2 = config.getReloadToken();
  const cleanup1 = token2.registerChangeCallback(() => called1++);
  token2.registerChangeCallback(() => called2++);

  cleanup1[Symbol.dispose]();

  config.reload();
  expect(called1).toBe(1);
  expect(called2).toBe(2);
});

test("New token after reload is not changed", async () => {
  // Arrange
  const configurationBuilder = new ConfigurationBuilder();
  const config = await configurationBuilder.build();

  // Act
  const token1 = config.getReloadToken();
  const hasChanged1 = token1.hasChanged;
  config.reload();
  const hasChanged2 = token1.hasChanged;
  const token2 = config.getReloadToken();
  const hasChanged3 = token2.hasChanged;

  // Assert
  expect(hasChanged1).toBe(false);
  expect(hasChanged2).toBe(true);
  expect(hasChanged3).toBe(false);
  expect(token1).not.toBe(token2);
});

test("Key starting with colon means first section has empty name", async () => {
  // Arrange
  const dict = new Map<string, string>([[":Key2", "value"]]);
  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.addMemoryCollection(dict);
  const config = await configurationBuilder.build();

  // Act
  const children = config.getChildren();

  // Assert
  expect(children.length).toBe(1);
  expect(children[0].key).toBe("");
  expect(children[0].getChildren().length).toBe(1);
  expect(children[0].getChildren()[0].key).toBe("Key2");
});

test("Key with double colon has section with empty name", async () => {
  // "Key1::Key3"
  // Arrange
  const dict = new Map<string, string>([["Key1::Key3", "value"]]);

  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.addMemoryCollection(dict);
  const config = await configurationBuilder.build();

  // Act
  const children = config.getChildren();

  // Assert
  expect(children.length).toBe(1);
  expect(children[0].key).toBe("Key1");
  expect(children[0].getChildren().length).toBe(1);
  expect(children[0].getChildren()[0].key).toBe("");
  expect(children[0].getChildren()[0].getChildren().length).toBe(1);
  expect(children[0].getChildren()[0].getChildren()[0].key).toBe("Key3");
});

test("Key ending with colon means last section has empty name", async () => {
  // Arrange
  const dict = new Map<string, string>([["Key1:", "value"]]);

  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.addMemoryCollection(dict);
  const config = await configurationBuilder.build();

  // Act
  const children = config.getChildren();

  // Assert
  expect(children.length).toBe(1);
  expect(children[0].key).toBe("Key1");
  expect(children[0].getChildren().length).toBe(1);
  expect(children[0].getChildren()[0].key).toBe("");
});

test("Section with value exists", async () => {
  // Arrange
  const dict = new Map<string, string>([
    ["Mem1", "Value1"],
    ["Mem1:KeyInMem1", "ValueInMem1"],
    ["Mem1:KeyInMem1:Deep1", "ValueDeep1"],
  ]);

  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.addMemoryCollection(dict);
  const config = await configurationBuilder.build();

  // Act
  const sectionExists1 = config.getSection("Mem1").exists();
  const sectionExists2 = config.getSection("Mem1:KeyInMem1").exists();
  const sectionNotExists = config.getSection("Mem2").exists();

  // Assert
  expect(sectionExists1).toBe(true);
  expect(sectionExists2).toBe(true);
  expect(sectionNotExists).toBe(false);
});

test("Section get required section success", async () => {
  // Arrange
  const dict = new Map<string, string>([
    ["Mem1", "Value1"],
    ["Mem1:KeyInMem1", "ValueInMem1"],
    ["Mem1:KeyInMem1:Deep1", "ValueDeep1"],
  ]);

  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.addMemoryCollection(dict);
  const config = await configurationBuilder.build();

  // Act
  const sectionExists1 = config.getSection("Mem1").exists();
  const sectionExists2 = config.getSection("Mem1:KeyInMem1").exists();

  // Assert
  expect(sectionExists1).toBe(true);
  expect(sectionExists2).toBe(true);
});

test("Section get required section missing throw exception", async () => {
  // Arrange
  const dict = new Map<string, string>([
    ["Mem1", "Value1"],
    ["Mem1:Deep1", "Value1"],
  ]);

  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.addMemoryCollection(dict);
  const config = await configurationBuilder.build();

  // Act
  const act1 = () => config.getRequiredSection("Mem2");
  const act2 = () => config.getRequiredSection("Mem1:Deep2");

  // Assert
  expect(act1).toThrowError();
  expect(act2).toThrowError();
});

test("Section with children exists", async () => {
  // Arrange
  const dict = new Map<string, string>([
    ["Mem1:KeyInMem1", "ValueInMem1"],
    ["Mem1:KeyInMem1:Deep1", "ValueDeep1"],
    ["Mem2:KeyInMem2:Deep1", "ValueDeep2"],
  ]);

  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.addMemoryCollection(dict);
  const config = await configurationBuilder.build();

  // Act
  const sectionExists1 = config.getSection("Mem1").exists();
  const sectionExists2 = config.getSection("Mem2").exists();
  const sectionNotExists = config.getSection("Mem3").exists();

  // Assert
  expect(sectionExists1).toBe(true);
  expect(sectionExists2).toBe(true);
  expect(sectionNotExists).toBe(false);
});

test.each(["Value1", ""])("Key with value and without children exists as section", async (value) => {
  // Arrange
  const dict = new Map<string, string>([["Mem1", value]]);

  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.addMemoryCollection(dict);
  const config = await configurationBuilder.build();

  // Act
  const sectionExists = config.getSection("Mem1").exists();

  // Assert
  expect(sectionExists).toBe(true);
});

test("Key with null value and without children is a section but not exists", async () => {
  // Arrange
  const dict = new Map<string, string | null>([["Mem1", null]]);

  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.addMemoryCollection(dict);
  const config = await configurationBuilder.build();

  // Act
  const sections = config.getChildren();
  const sectionExists = config.getSection("Mem1").exists();
  const sectionChildren = config.getSection("Mem1").getChildren();

  // Assert
  expect(sections.length).toBe(1);
  expect(sectionExists).toBe(false);
  expect(sectionChildren.length).toBe(0);
});

test("Section with children has null value", async () => {
  // Arrange
  const dict = new Map<string, string>([["Mem1:KeyInMem1", "ValueInMem1"]]);

  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.addMemoryCollection(dict);
  const config = await configurationBuilder.build();

  // Act
  const sectionValue = config.getSection("Mem1").value;

  // Assert
  expect(sectionValue).toBeNull();
});

class NullReloadTokenConfigSource implements IConfigurationSource, IConfigurationProvider {
  public get(key: string): string | null | undefined {
    throw new Error("Method not implemented.");
  }
  public set(key: string, value: string | null): void {
    throw new Error("Method not implemented.");
  }
  public getChildKeys(earlierKeys: string[], parentPath?: string): string[] {
    throw new Error("Method not implemented.");
  }
  public load() {
    return Promise.resolve();
  }

  public getReloadToken() {
    return null;
  }

  public async build(builder: IConfigurationBuilder): Promise<IConfigurationProvider> {
    return this;
  }
}

test("Provider with null reload token", async () => {
  // Arrange
  const configurationBuilder = new ConfigurationBuilder();
  configurationBuilder.add(new NullReloadTokenConfigSource());

  // Act
  const config = await configurationBuilder.build();

  // Assert
  expect(config.getReloadToken()).not.toBeNull();
});
