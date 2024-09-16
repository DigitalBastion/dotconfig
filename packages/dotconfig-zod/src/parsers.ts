import { z, type AnyZodObject } from "zod";
import type { IConfiguration } from "dotconfig/abstractions";

export function parseConfiguration<TSchema extends AnyZodObject>(schema: TSchema, configuration: IConfiguration): z.infer<TSchema> {
    return schema.parse(getConfigurationProxy(schema, configuration));
}

function getConfigurationProxy<TSchema extends AnyZodObject>(schema: TSchema, configuration: IConfiguration, parentPath: string | null = null) {
    const configurationProxy = new Proxy({}, {
        get(_, getKey) {
            if (typeof getKey === "symbol") {
                return undefined;
            }

            const fieldSchema = schema.shape[getKey];
            const key = parentPath == null ? getKey : `${parentPath}:${getKey}`;

            if (fieldSchema instanceof z.ZodObject) {
                return getConfigurationProxy(fieldSchema, configuration, key);
            }

            const value = configuration.get(key);
            return value;
        }
    });

    return configurationProxy;
}
