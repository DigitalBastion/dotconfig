import type { IConfiguration, IConfigurationSection } from "./abstractions";

export function* getConfigurationEntries(
    configuration: IConfiguration,
    makePathsRelative = false
) {
    const stack: IConfiguration[] = [configuration];
    const prefixLength = (makePathsRelative && isConfigurationSection(configuration))
        ? configuration.path.length + 1
        : 0;

    while (stack.length > 0) {
        // biome-ignore lint/style/noNonNullAssertion: Already checked in the while loop.
        const config = stack.pop()!;

        // Don't include the sections value if we are removing paths, since it will be an empty key
        if (isConfigurationSection(config) && (!makePathsRelative || config !== configuration)) {
            yield [config.path.substring(prefixLength), config.value];
        }

        for (const child of config.getChildren()) {
            stack.push(child);
        }
    }
}

function isConfigurationSection(config: IConfiguration): config is IConfigurationSection {
    return 'path' in config && 'value' in config;
}