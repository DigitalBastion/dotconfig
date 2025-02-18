import type { IChangeToken, IConfigurationRoot, IConfigurationSection } from "./abstractions.js";
import { getSectionKey, combine } from "./configuration-path.js";

export class ConfigurationSection implements IConfigurationSection {
  constructor(root: IConfigurationRoot, path: string) {
    this.#root = root;
    this.#path = path;
  }

  #root: IConfigurationRoot;
  #path: string;

  public get path() {
    return this.#path;
  }

  public get key() {
    return getSectionKey(this.#path);
  }

  public get value() {
    return this.#root.get(this.#path);
  }

  public set value(value: string | null) {
    this.#root.set(this.#path, value);
  }

  public get(key: string): string | null {
    return this.#root.get(combine(this.#path, key));
  }

  public set(key: string, value: string | null): void {
    this.#root.set(combine(this.#path, key), value);
  }

  public getSection(key: string) {
    return this.#root.getSection(combine(this.#path, key));
  }

  public getChildren(): IConfigurationSection[] {
    return this.#root.getChildren(this.#path);
  }

  public getReloadToken(): IChangeToken {
    return this.#root.getReloadToken();
  }
}
