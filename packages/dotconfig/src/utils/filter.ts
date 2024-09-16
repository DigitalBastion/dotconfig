export function filterCaseInsensitiveDuplicates<T>(array: T[]): T[] {
    const set = new Set<string>();
    const result: T[] = [];

    for (const item of array) {
        const key = String(item).toLowerCase();

        if (set.has(key)) {
            continue;
        }

        set.add(key);
        result.push(item);
    }

    return result;
}
