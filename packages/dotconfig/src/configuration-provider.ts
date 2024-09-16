import type { IConfigurationProvider } from "./abstractions";
import { ConfigurationData } from "./configuration-data";
import { compare, KEY_DELIMITER } from "./configuration-path";

export class ConfigurationProvider implements IConfigurationProvider {
    protected readonly data = new ConfigurationData();

    public get(key: string): string | null | undefined {
        return this.data.get(key);
    }

    public set(key: string, value: string | null): void {
        this.data.set(key, value);
    }

    public getChildKeys(earlierKeys: string[], parentPath?: string): string[] {
        const results: string[] = [...earlierKeys];

        if (parentPath == null) {
            for (const [key] of this.data) {
                results.push(this.segment(key, 0));
            }

            results.sort(compare);
            return results;
        }

        for (const [key] of this.data) {
            if (key.length > parentPath.length &&
                key.toLowerCase().startsWith(parentPath.toLowerCase()) &&
                key[parentPath.length] === KEY_DELIMITER) {
                results.push(this.segment(key, parentPath.length + 1));
            }
        }

        results.sort(compare);
        return results;
    }

    public load(): Promise<void> {
        return Promise.resolve();
    }

    public getReloadToken(): unknown {
        return null;
    }

    private segment(key: string, prefixLength: number): string {
        const indexOf = key.indexOf(KEY_DELIMITER, prefixLength);
        return indexOf < 0 ? key.substring(prefixLength) : key.substring(prefixLength, indexOf);
    }
}
