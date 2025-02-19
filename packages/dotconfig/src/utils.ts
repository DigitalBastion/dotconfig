import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { IConfiguration, IConfigurationRoot, IConfigurationSection } from "./abstractions.js";
import { ConfigurationTypeSymbol } from "./constants.js";
import { ParseErrors } from "./errors.js";

/**
 * Get the iterator of key-value pairs for the configuration.
 * @param configuration The configuration to iterate.
 */
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

/**
 * Parse the configuration using the schema.
 * @param schema The schema to use for parsing.
 * @param configuration The configuration to parse.
 */
export async function parseConfiguration<T extends StandardSchemaV1>(
  schema: T,
  configuration: IConfigurationSection,
): Promise<StandardSchemaV1.InferOutput<T>> {
  let result = schema["~standard"].validate(getConfigurationProxy(configuration));
  if (result instanceof Promise) {
    result = await result;
  }

  if (result.issues != null) {
    throw new ParseErrors(result.issues, { configurationPath: configuration.path });
  }

  return result.value;
}

function getConfigurationProxy(configuration: IConfiguration, parentPath: string | null = null): unknown {
  const configurationProxy = new Proxy(
    {},
    {
      get(_, getKey) {
        if (typeof getKey === "symbol" || getKey === "then") {
          return undefined;
        }

        const key = parentPath == null ? getKey : `${parentPath}:${getKey}`;
        if (configuration.getSection(key).getChildren().length > 0) {
          return getConfigurationProxy(configuration.getSection(key), key);
        }

        const value = configuration.get(getKey);
        return value;
      },
    },
  );

  return configurationProxy;
}

/**
 * Checks if the configuration is a section.
 * @param config The configuration to check.
 */
export function isConfigurationSection(config: IConfiguration): config is IConfigurationSection {
  return config[ConfigurationTypeSymbol] === "section";
}

/**
 * Checks if the configuration is a root.
 * @param config The configuration to check.
 */
export function isConfigurationRoot(config: IConfiguration): config is IConfigurationRoot {
  return config[ConfigurationTypeSymbol] === "root";
}
