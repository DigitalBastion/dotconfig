import type { ConfigurationProvider } from "../configuration-provider.js";
import { unflatten } from "../utils/flatten.js";

export interface EnvironmentConfigurationProviderOptions {
    prefix?: string;
    delimiter?: string;
    env?: NodeJS.ProcessEnv;
}

export class EnvironmentConfigurationProvider implements ConfigurationProvider {
    constructor(private options: EnvironmentConfigurationProviderOptions = {}) { }

    async load() {
        const values = new Map(Object.entries(this.options.env ?? process.env));
        const delimiter = this.options.delimiter ?? "__";
        const prefix = this.options.prefix == null ? "" : this.options.prefix + delimiter;

        for (const [key, value] of values) {
            if (!key.includes(delimiter)) {
                values.delete(key);
                continue;
            }

            if (prefix !== "" && key.startsWith(prefix)) {
                values.set(key.slice(prefix.length), value);
                values.delete(key);
            }
        }

        const result = unflatten(values, { delimiter: delimiter });

        return result;
    }
}
