export class ConfigurationData extends Map<string, string | null> {
  #caseInsensitiveMap = new Map<string, string>();

  public override get(key: string): string | null | undefined {
    const casedKey = this.#caseInsensitiveMap.get(key.toLowerCase());
    return casedKey ? super.get(casedKey) : undefined;
  }

  public override set(key: string, value: string | null): this {
    this.#caseInsensitiveMap.set(key.toLowerCase(), key);

    return super.set(key, value);
  }

  public override delete(key: string): boolean {
    const casedKey = this.#caseInsensitiveMap.get(key.toLowerCase());
    if (casedKey == null) {
      return false;
    }

    this.#caseInsensitiveMap.delete(key.toLowerCase());
    return super.delete(casedKey);
  }

  public override has(key: string): boolean {
    return this.#caseInsensitiveMap.has(key.toLowerCase());
  }
}
