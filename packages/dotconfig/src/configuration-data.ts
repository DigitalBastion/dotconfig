export class ConfigurationData extends Map<string, string | null> {
    #caseInsensitiveMap = new Map<string, string>();

    public get(key: string) {
        const casedKey = this.#caseInsensitiveMap.get(key.toLowerCase());
        return casedKey ? super.get(casedKey) : undefined;
    }

    public set(key: string, value: string | null) {
        this.#caseInsensitiveMap.set(key.toLowerCase(), key);

        return super.set(key, value);
    }

    public delete(key: string) {
        const casedKey = this.#caseInsensitiveMap.get(key.toLowerCase());
        if (casedKey == null) {
            return false;
        }

        this.#caseInsensitiveMap.delete(key.toLowerCase());
        return super.delete(casedKey);
    }

    public has(key: string) {
        return this.#caseInsensitiveMap.has(key.toLowerCase());
    }
}
