import type { ConfigurationProvider } from "./configuration-provider.js";
import { Configuration } from "./configuration.js";
import { DELIMITER } from "./constants.js";
import {
  EnvironmentConfigurationProvider,
  type EnvironmentConfigurationProviderOptions,
} from "./providers/environment.js";
import { InMemoryConfigurationProvider } from "./providers/in-memory.js";
import { JsonFileConfigurationProvider, type JsonFileConfigurationProviderOptions } from "./providers/json-file.js";
import { flatten } from "./utils/flatten.js";

export interface ConfigBuilderOptions {
  logger?: Console;
}

export class ConfigurationBuilder {
  constructor(protected options: ConfigBuilderOptions = {}) {}

  protected providers: ConfigurationProvider[] = [];

  public addEnvironmentVariables(options: EnvironmentConfigurationProviderOptions = {}): this {
    const provider = new EnvironmentConfigurationProvider(options);
    this.providers.push(provider);
    return this;
  }

  public addJsonFile(options: JsonFileConfigurationProviderOptions): this {
    const provider = new JsonFileConfigurationProvider(options);
    this.providers.push(provider);
    return this;
  }

  public addInMemory(data: Record<string, unknown>): this {
    const provider = new InMemoryConfigurationProvider(data);
    this.providers.push(provider);
    return this;
  }

  public addProvider(provider: ConfigurationProvider): this {
    this.providers.push(provider);
    return this;
  }

  public async build(): Promise<Configuration> {
    const flatConfig = new Map<string, string>();

    for (const provider of this.providers) {
      const data = await provider.load();

      const flattenData = flatten(data, {
        delimiter: DELIMITER,
      });

      for (const [key, value] of flattenData) {
        if (value == null) {
          continue;
        }

        flatConfig.set(key, value.toString());
      }
    }
    const configuration = new Configuration(flatConfig);

    return configuration;
  }
}
