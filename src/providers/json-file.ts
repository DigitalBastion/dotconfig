import { readFile } from "node:fs/promises";
import type { ConfigurationProvider } from "../configuration-provider.js";

export interface JsonFileConfigurationProviderOptions {
    path: string;
    optional?: boolean;
}

export class JsonFileConfigurationProvider implements ConfigurationProvider {
    constructor(private options: JsonFileConfigurationProviderOptions) { }

    async load() {
        try {
            const raw = await readFile(this.options.path, "utf-8");
            const result = JSON.parse(raw);

            return result;
        } catch (error) {
            if (this.options.optional) {
                return {};
            }

            throw error;
        }
    }
}
