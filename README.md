# dotconfig

A powerful configuration builder using various sources: environment variables, local json files, and secure key vaults.

## Supported Providers

- [x] In memory
- [x] Environment variables
- [] Json file

## Getting Started

```ts
import { ConfigurationBuilder } from "dotconfig";

const configuration = await new ConfigurationBuilder()
  .add(new MemoryConfigurationSource(new Map<string, string>([["a:b:c", "1"]])))
  .build();

const value = configuration.get("a:b:b"); // => "1"
```

Readme WIP.
