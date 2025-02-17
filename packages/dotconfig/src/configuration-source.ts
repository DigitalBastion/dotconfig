import type { IConfigurationBuilder, IConfigurationProvider, IConfigurationSource } from "./abstractions.js";

export abstract class ConfigurationSource implements IConfigurationSource {
  public abstract build(builder: IConfigurationBuilder): Promise<IConfigurationProvider>;
}
