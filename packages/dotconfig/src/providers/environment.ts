import type { IConfigurationProvider } from "../abstractions.js";
import { ConfigurationProvider } from "../configuration-provider.js";
import { ConfigurationSource } from "../configuration-source.js";

export interface EnvironmentSourceOptions {
  delimiter?: string;
  env?: NodeJS.ProcessEnv;
}

export class EnvironmentSource extends ConfigurationSource {
  constructor(options: EnvironmentSourceOptions = {}) {
    super();
    this.#environmentVariables = options.env ?? process.env;
    this.#delimiter = options.delimiter ?? "__";
  }

  #delimiter: string;
  #environmentVariables: NodeJS.ProcessEnv;

  public get environmentVariables() {
    return this.#environmentVariables;
  }

  public get delimiter() {
    return this.#delimiter;
  }

  public async build(): Promise<IConfigurationProvider> {
    const provider = new EnvironmentProvider(this);
    await provider.load();

    return provider;
  }
}

export class EnvironmentProvider extends ConfigurationProvider {
  constructor(source: EnvironmentSource) {
    super();
    this.#source = source;
  }

  #source: EnvironmentSource;

  public override load(): Promise<void> {
    for (const [envKey, value] of Object.entries(this.#source.environmentVariables)) {
      // It must contain for top configuration section.
      if (!envKey.includes(this.#source.delimiter)) {
        continue;
      }
      const key = envKey.replace(this.#source.delimiter, ":");
      this.set(key, value ?? null);
    }

    return Promise.resolve();
  }
}
