export interface ConfigurationProvider {
    load(): Promise<Record<string, unknown>>;
}
