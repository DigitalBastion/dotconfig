import type { IConfiguration, IConfigurationProvider, IConfigurationSource } from "../abstractions.js";
import { compare } from "../configuration-path.js";

export class ChainedConfigurationSource implements IConfigurationSource {
  constructor(configuration: IConfiguration) {
    this.#configuration = configuration;
  }

  #configuration: IConfiguration;

  public get configuration() {
    return this.#configuration;
  }

  public async build() {
    return new ChainedConfigurationProvider(this);
  }
}

export class ChainedConfigurationProvider implements IConfigurationProvider {
  constructor(source: ChainedConfigurationSource) {
    this.#source = source;
  }

  #source: ChainedConfigurationSource;

  public get(key: string): string | null | undefined {
    return this.#source.configuration.get(key);
  }

  public set(key: string, value: string | null): void {
    this.#source.configuration.set(key, value);
  }

  public getChildKeys(earlierKeys: string[], parentPath?: string): string[] {
    const section = parentPath == null ? this.#source.configuration : this.#source.configuration.getSection(parentPath);
    const keys: string[] = [...earlierKeys];

    for (const child of section.getChildren()) {
      keys.push(child.key);
    }

    keys.sort(compare);
    return keys;
  }

  public load(): Promise<void> {
    return Promise.resolve();
  }

  public getReloadToken() {
    return this.#source.configuration.getReloadToken();
  }
}
