import type { IConfigurationProvider, IConfigurationRoot, IConfigurationSection } from "./abstractions.js";
import { combine } from "./configuration-path.js";
import { ConfigurationSection } from "./configuration-section.js";

export class ConfigurationRoot implements IConfigurationRoot {
    public constructor(providers: IConfigurationProvider[]) {
        this.#providers = providers;
    }

    #providers: IConfigurationProvider[];

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
        // TODO: Fix.

        for (const provider of this.#providers) {
            await provider.load();
        }
    }

    public getChildren(path?: string): IConfigurationSection[] {
        return this.#providers
            .reduce((seed, source) => source.getChildKeys(seed, path), [] as string[])
            .map(key => this.getSection(path == null ? key : combine(path, key)));
    }

    public getReloadToken() {
        throw new Error("Method not implemented.");
    }
}
