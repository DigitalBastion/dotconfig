import { expect, test } from "bun:test";
import { ConfigurationBuilder } from "../src/configuration-builder.js";

test("It should produce configuration instance.", async () => {
  const builder = new ConfigurationBuilder().addInMemory({
    Logging: {
      Enabled: true,
      LogLevel: "Info",
    },
    Database: {
      ConnectionString: "test_connection",
      MaxConnections: 100,
    },
    App: {
      Settings: {
        Version: "1.0.0",
        Name: "TestApp",
      },
    },
  });

  const configuration = await builder.build();

  expect(configuration.toObject()).toMatchSnapshot();
});
