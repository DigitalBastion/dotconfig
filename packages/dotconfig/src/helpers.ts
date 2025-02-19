import type { IConfiguration } from "./abstractions.js";
import { isConfigurationSection } from "./utils.js";

/**
 * Get the iterator of key-value pairs for the configuration.
 * @param configuration The configuration to iterate.
 * @param makePathsRelative `true` to trim the current configuration's path from the front of the returned child keys.
 */
export function* iterateConfigurationEntries(
  configuration: IConfiguration,
  makePathsRelative = false,
): Iterable<readonly [string, string | null]> {
  const stack: IConfiguration[] = [configuration];
  const prefixLength = makePathsRelative && isConfigurationSection(configuration) ? configuration.path.length + 1 : 0;

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


export function dispose(instance: unknown): void {
  if (typeof instance !== "object" || instance === null) {
    return;
  }

  (instance as Disposable)[Symbol.dispose]?.();
}
