import type { IConfiguration, IConfigurationRoot, IConfigurationSection } from "./abstractions.js";
import { ConfigurationTypeSymbol } from "./constants.js";

export function* configurationIterator(configuration: IConfiguration): Iterator<[string, string | null]> {
  const stack: IConfiguration[] = [configuration];

  while (stack.length > 0) {
    // biome-ignore lint/style/noNonNullAssertion: We already checking in the while loop.
    const config = stack.pop()!;

    if (config !== configuration && isConfigurationSection(config)) {
      yield [config.path, config.value];
    }
    for (const child of config.getChildren()) {
      stack.push(child);
    }
  }
}

export function isConfigurationSection(config: IConfiguration): config is IConfigurationSection {
  return config[ConfigurationTypeSymbol] === "section";
}

export function isConfigurationRoot(config: IConfiguration): config is IConfigurationRoot {
  return config[ConfigurationTypeSymbol] === "root";
}
