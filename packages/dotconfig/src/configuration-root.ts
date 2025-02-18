import type { IConfigurationProvider, IConfigurationRoot, IConfigurationSection } from "./abstractions.js";
import { createChangeToken } from "./change-token.js";
import { combine } from "./configuration-path.js";
import { ConfigurationReloadToken } from "./configuration-reload-token.js";
import { ConfigurationSection } from "./configuration-section.js";
import { dispose } from "./helpers.js";

export class ConfigurationRoot implements IConfigurationRoot, Disposable {
  public constructor(providers: IConfigurationProvider[]) {
    this.#providers = providers;

    for (const provider of providers) {
      this.#changeTokenRegistrations.push(
        createChangeToken(
          () => provider.getReloadToken(),
          () => this.raiseChanged(),
        ),
      );
    }
  }

  #providers: IConfigurationProvider[];
  #changeToken = new ConfigurationReloadToken();
  #changeTokenRegistrations: Disposable[] = [];

  public get providers() {
    return this.#providers;
  }

  public get(key: string): string | null {
    for (let i = this.#providers.length - 1; i >= 0; i--) {
      const value = this.#providers[i]?.get(key);
      if (value === undefined) {
        continue;
      }

      return value;
    }

    return null;
  }

  public set(key: string, value: string | null): void {
    if (this.#providers.length === 0) {
      throw new Error("No providers are available.");
    }

    for (const provider of this.#providers) {
      provider.set(key, value);
    }
  }

  public getSection(key: string): IConfigurationSection {
    return new ConfigurationSection(this, key);
  }

  public async reload(): Promise<void> {
    for (const provider of this.#providers) {
      await provider.load();
    }

    this.raiseChanged();
  }

  private raiseChanged() {
    const previousToken = this.#changeToken;
    this.#changeToken = new ConfigurationReloadToken();
    previousToken.onReload();
  }

  public getChildren(path?: string): IConfigurationSection[] {
    return this.#providers
      .reduce((seed, source) => source.getChildKeys(seed, path), [] as string[])
      .map((key) => this.getSection(path == null ? key : combine(path, key)));
  }

  public getReloadToken() {
    return this.#changeToken;
  }

  public [Symbol.dispose](): void {
    for (const registration of this.#changeTokenRegistrations) {
      registration[Symbol.dispose]();
    }

    for (const provider of this.#providers) {
      dispose(provider);
    }
  }
}
