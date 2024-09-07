import { expect, test } from "bun:test";
import { EnvironmentConfigurationProvider } from "../../src/providers/environment.js";

test("It should load environment variables with nested configurations.", async () => {
    const provider = new EnvironmentConfigurationProvider({
        env: {
            Logging__Enabled: "true",
            Logging__LogLevel: "Info",
            Database__ConnectionString: "test_connection",
            Database__MaxConnections: "100",
            App__Settings__Version: "1.0.0",
            App__Settings__Name: "TestApp",
        },
    });

    const result = await provider.load();
    expect(result).toEqual({
        Logging: {
            Enabled: "true",
            LogLevel: "Info"
        },
        Database: {
            ConnectionString: "test_connection",
            MaxConnections: "100"
        },
        App: {
            Settings: {
                Version: "1.0.0",
                Name: "TestApp"
            }
        },
    });
});

test("It should ignore keys that are not in sections, but in root object.", async () => {
    const provider = new EnvironmentConfigurationProvider({
        env: {
            Logging__Enabled: "true",
            DatabaseConnectionString: "test_connection",
            App__Version: "1.0.0",
        },
    });

    const result = await provider.load();
    expect(result).toEqual({
        Logging: { Enabled: "true" },
        App: { Version: "1.0.0" },
    });
});

test("It should use a custom delimiter.", async () => {
    const provider = new EnvironmentConfigurationProvider({
        delimiter: "_",
        env: {
            "Logging_Enabled": "true",
            "Logging_LogLevel": "Warn",
            "Database_Connection_String": "test_connection",
            "Database_Connection_Timeout": "30",
        },
    });

    const result = await provider.load();
    expect(result).toEqual({
        Logging: {
            Enabled: "true",
            LogLevel: "Warn"
        },
        Database: {
            Connection: {
                String: "test_connection",
                Timeout: "30"
            }
        },
    });
});

test("It should handle deeply nested keys within root sections.", async () => {
    const provider = new EnvironmentConfigurationProvider({
        env: {
            Logging__Console__Enabled: "true",
            Logging__File__Path: "/var/log/app.log",
            Logging__File__MaxSize: "10MB",
            Database__Connections__Primary__ConnectionString: "primary_connection",
            Database__Connections__Secondary__ConnectionString: "secondary_connection",
        },
    });

    const result = await provider.load();
    expect(result).toEqual({
        Logging: {
            Console: { Enabled: "true" },
            File: {
                Path: "/var/log/app.log",
                MaxSize: "10MB"
            },
        },
        Database: {
            Connections: {
                Primary: { ConnectionString: "primary_connection" },
                Secondary: { ConnectionString: "secondary_connection" }
            }
        },
    });
});

test("It should handle empty environment.", async () => {
    const provider = new EnvironmentConfigurationProvider({ env: {} });
    const result = await provider.load();
    expect(result).toEqual({});
});
