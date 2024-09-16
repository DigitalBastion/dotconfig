import type { IConfigurationBuilder, IConfigurationProvider, IConfigurationSource } from "./abstractions";

export abstract class ConfigurationSource implements IConfigurationSource {
    public abstract build(builder: IConfigurationBuilder): Promise<IConfigurationProvider>;
}
