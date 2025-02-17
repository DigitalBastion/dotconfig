import type { IConfigurationProvider } from "../abstractions.js";
import { ConfigurationProvider } from "../configuration-provider.js";
import { ConfigurationSource } from "../configuration-source.js";

export class MemoryConfigurationSource extends ConfigurationSource {
  constructor(config: Map<string, string | null>) {
    super();
    this.#config = config;
  }

  #config: Map<string, string | null>;

  public get config() {
    return this.#config;
  }

  public async build(): Promise<IConfigurationProvider> {
    const provider = new MemoryConfigurationProvider(this);
    await provider.load();

    return provider;
  }
}

export class MemoryConfigurationProvider extends ConfigurationProvider {
  constructor(source: MemoryConfigurationSource) {
    super();
    this.#source = source;
  }

  #source: MemoryConfigurationSource;

  public override load(): Promise<void> {
    for (const [key, value] of this.#source.config) {
      this.set(key, value);
    }

    return Promise.resolve();
  }
}
