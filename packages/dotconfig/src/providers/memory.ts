import type { IConfigurationProvider } from "../abstractions";
import { ConfigurationProvider } from "../configuration-provider";
import { ConfigurationSource } from "../configuration-source";

export class MemoryConfigurationSource extends ConfigurationSource {
  constructor(config: Map<string, string>) {
    super();
    this.#config = config;
  }

  #config: Map<string, string>;

  public get config() {
    return this.#config;
  }

  public async build(): Promise<IConfigurationProvider> {
    const provider = new MemoryConfigurationProvider(this)
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

  public load(): Promise<void> {
    for (const [key, value] of this.#source.config) {
      this.set(key, value);
    }

    return Promise.resolve();
  }
}
