import { expect, test } from "bun:test";
import { EnvironmentSource } from "../../src/providers/environment";

test("Should load environment variables", async () => {
    const mongodbLocalUrl = "mongodb://localhost:27017";

    const source = new EnvironmentSource({
        env: {
            "mongodb__connectionString": mongodbLocalUrl,
            "mongodb__database": "test",
            "auth__secret": "secret",
            "auth__issuer": "ACME",
        }
    });

    const provider = await source.build();

    expect(provider.get("mongodb:connectionString")).toBe(mongodbLocalUrl);
});
