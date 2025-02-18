import type { IChangeToken, IConfigurationProvider } from "./abstractions.js";
import { ConfigurationData } from "./configuration-data.js";
import { compare, KEY_DELIMITER } from "./configuration-path.js";
import { ConfigurationReloadToken } from "./configuration-reload-token.js";
import { filterCaseInsensitiveDuplicates } from "./utils/filter.js";

export class ConfigurationProvider implements IConfigurationProvider {
  protected readonly data = new ConfigurationData();
  #reloadToken = new ConfigurationReloadToken();

  public get(key: string): string | null | undefined {
    return this.data.get(key);
  }

  public set(key: string, value: string | null): void {
    this.data.set(key, value);
  }

  public getChildKeys(earlierKeys: string[], parentPath?: string): string[] {
    const keys: string[] = [...earlierKeys];

    if (parentPath == null) {
      for (const [key] of this.data) {
        keys.push(this.segment(key, 0));
      }

      return filterCaseInsensitiveDuplicates(keys).sort(compare);
    }

    for (const [key] of this.data) {
      if (
        key.length > parentPath.length &&
        key.toLowerCase().startsWith(parentPath.toLowerCase()) &&
        key[parentPath.length] === KEY_DELIMITER
      ) {
        keys.push(this.segment(key, parentPath.length + 1));
      }
    }

    return filterCaseInsensitiveDuplicates(keys).sort(compare);
  }

  public load(): Promise<void> {
    return Promise.resolve();
  }

  public getReloadToken(): IChangeToken {
    return this.#reloadToken;
  }

  protected onReload(): void {
    const previousToken = this.#reloadToken;
    this.#reloadToken = new ConfigurationReloadToken();
    previousToken.onReload();
  }

  private segment(key: string, prefixLength: number): string {
    const indexOf = key.indexOf(KEY_DELIMITER, prefixLength);
    return indexOf < 0 ? key.substring(prefixLength) : key.substring(prefixLength, indexOf);
  }
}
