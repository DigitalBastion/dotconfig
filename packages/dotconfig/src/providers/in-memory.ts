import type { ConfigurationProvider } from "../configuration-provider.js";

export class InMemoryConfigurationProvider implements ConfigurationProvider {
  constructor(private data: Record<string, unknown>) {}

  async load() {
    return this.data;
  }
}
