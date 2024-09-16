/**
 * The delimiter used to separate individual keys in a path.
 */
export const KEY_DELIMITER = ":";

/**
 * Combines path segments into one path.
 * @param pathSegments The path segments to combine.
 * @returns The combined path.
 */
export function combine(...pathSegments: string[]): string {
    return pathSegments.join(KEY_DELIMITER);
}

/**
 * Combines an array of path segments into one path.
 * @param pathSegments The path segments to combine.
 * @returns The combined path.
 */
export function combineArray(pathSegments: string[]): string {
    return pathSegments.join(KEY_DELIMITER);
}

/**
 * Extracts the last path segment from the path.
 * @param path The path.
 * @returns The last path segment of the path.
 */
export function getSectionKey(path: string): string {
    const lastDelimiterIndex = path.lastIndexOf(KEY_DELIMITER);
    return lastDelimiterIndex < 0 ? path : path.substring(lastDelimiterIndex + 1);
}

/**
 * Extracts the path corresponding to the parent node for a given path.
 * @param path The path.
 * @returns The original path minus the last individual segment found in it. Null if the original path corresponds to a top level node.
 */
export function getParentPath(path: string | null): string | null {
    if (path == null) {
        return null;
    }

    const lastDelimiterIndex = path.lastIndexOf(KEY_DELIMITER);
    return lastDelimiterIndex < 0 ? null : path.substring(0, lastDelimiterIndex);
}

export function compare(x: string | null, y: string | null): number {
    let xSpan = x == null ? "" : skipAheadOnDelimiter(x);
    let ySpan = y == null ? "" : skipAheadOnDelimiter(y);

    if (xSpan === ySpan) {
        return 0;
    }

    while (xSpan && ySpan) {
        const xDelimiterIndex = xSpan.indexOf(KEY_DELIMITER);
        const yDelimiterIndex = ySpan.indexOf(KEY_DELIMITER);

        const xPart = xDelimiterIndex === -1 ? xSpan : xSpan.slice(0, xDelimiterIndex);
        const yPart = yDelimiterIndex === -1 ? ySpan : ySpan.slice(0, yDelimiterIndex);

        const compareResult = compareParts(xPart, yPart);
        if (compareResult !== 0) {
            return compareResult;
        }

        xSpan = xDelimiterIndex === -1 ? '' : skipAheadOnDelimiter(xSpan.slice(xDelimiterIndex + 1));
        ySpan = yDelimiterIndex === -1 ? '' : skipAheadOnDelimiter(ySpan.slice(yDelimiterIndex + 1));
    }

    return xSpan === '' ? (ySpan === '' ? 0 : -1) : 1;
}

function skipAheadOnDelimiter(str: string): string {
    let result = str;
    while (result.startsWith(KEY_DELIMITER)) {
        result = result.slice(1);
    }

    return result;
}

function compareParts(a: string, b: string): number {
    const aIsInt = isInteger(a);
    const bIsInt = isInteger(b);

    if (aIsInt && bIsInt) {
        // Both are integers
        return Number.parseInt(a) - Number.parseInt(b);
    }

    if (!aIsInt && !bIsInt) {
        // Both are strings
        return a.localeCompare(b, undefined, { sensitivity: 'accent' });
    }

    return aIsInt ? -1 : 1;
}

function isInteger(str: string): boolean {
    return /^-?\d+$/.test(str);
}
