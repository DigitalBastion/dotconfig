import type {
  IConfigurationBuilder,
  IConfigurationProvider,
  IConfigurationSource,
} from "./abstractions.js";
import { ConfigurationRoot } from "./configuration-root.js";
import { EnvironmentSource } from "./providers/environment.js";
import { MemoryConfigurationSource } from "./providers/memory.js";

/**
 * Builds key/value-based configuration settings for use in an application.
 */
export class ConfigurationBuilder implements IConfigurationBuilder {
  #sources: IConfigurationSource[] = [];
  #properties = new Map<string, unknown>();

  /**
   * Gets the sources used to obtain configuration values.
   */
  public get sources(): IConfigurationSource[] {
    return this.#sources;
  }

  /**
   * Gets a key/value collection that can be used to share data between the {@link IConfigurationBuilder} and the registered {@link IConfigurationProvider} providers.
   */
  public get properties(): Map<string, unknown> {
    return this.#properties;
  }

  /**
   * Adds a new configuration source.
   * @param source The configuration source to add.
   * @returns The same {@link ConfigurationBuilder}.
   */
  public add(source: IConfigurationSource): this {
    this.#sources.push(source);
    return this;
  }

  /**
   * Adds environment variables as a configuration source.
   * @param delimiter The delimiter used to separate keys from values in environment variables. Default is `__`.
   * @returns The same {@link ConfigurationBuilder}.
   */
  public addEnvironmentVariables(delimiter?: string): this {
    this.add(new EnvironmentSource({ delimiter }));
    return this;
  }

  /**
   * Adds a memory collection as a configuration source.
   * @param collection The memory collection to add.
   * @returns The same {@link ConfigurationBuilder}.
   */
  public addMemoryCollection(collection: Map<string, string | null>): this {
    this.add(new MemoryConfigurationSource(collection));
    return this;
  }

  /**
   * Builds an {@link IConfigurationRoot} with the sources added to this builder.
   * @returns A new {@link IConfigurationRoot}.
   */
  public async build(): Promise<ConfigurationRoot> {
    const providerPromises: Array<Promise<IConfigurationProvider>> =
      this.#sources.map((source) => source.build(this));
    const providers = await Promise.all(providerPromises);
    return new ConfigurationRoot(providers);
  }
}
