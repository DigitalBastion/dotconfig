import type { IConfigurationBuilder, IConfigurationProvider, IConfigurationSource } from "./abstractions";
import { ConfigurationRoot } from "./configuration-root";

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

    public async build() {
        const providerPromises: Array<Promise<IConfigurationProvider>> = this.#sources.map(source => source.build(this));
        const providers = await Promise.all(providerPromises);
        return new ConfigurationRoot(providers);
    }
}