import type { IConfigurationBuilder, IConfigurationProvider, IConfigurationSource } from "./abstractions.js";
import { ConfigurationRoot } from "./configuration-root.js";
import { EnvironmentSource } from "./providers/environment.js";
import { MemoryConfigurationSource } from "./providers/memory.js";

export class ConfigurationBuilder implements IConfigurationBuilder {
    #sources: IConfigurationSource[] = [];
    #properties = new Map<string, unknown>();

    public get sources() {
        return this.#sources;
    }

    public get properties() {
        return this.#properties;
    }

    public add(source: IConfigurationSource): this {
        this.#sources.push(source);
        return this;
    }

    public addEnvironmentVariables(delimiter?: string): this {
        this.add(new EnvironmentSource({ delimiter }));
        return this;
    }

    public addMemoryCollection(collection: Map<string, string | null>): this {
        this.add(new MemoryConfigurationSource(collection));
        return this;
    }

    public async build() {
        const providerPromises: Array<Promise<IConfigurationProvider>> = this.#sources.map(source => source.build(this));
        const providers = await Promise.all(providerPromises);
        return new ConfigurationRoot(providers);
    }
}