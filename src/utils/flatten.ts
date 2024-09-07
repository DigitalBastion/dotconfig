export class CircularReferenceError extends Error {
    constructor(public readonly path: string) {
        super("Circular references are not supported.");
    }
}

export type Primitive = string | number | boolean | null | undefined;
export type NestedObject = { [key: string]: unknown };

export interface FlattenOptions {
    delimiter?: string;
    transformKey?: (key: string) => string;
}

export function flatten(target: NestedObject, options: FlattenOptions = {}) {
    const delimiter = options.delimiter ?? '.';
    const transformKey = options.transformKey ?? ((key) => key);
    const result = new Map<string, Primitive>();
    const handledObjects = new WeakSet<NestedObject>();

    const stack: Array<{ obj: NestedObject; prefix: string }> = [{ obj: target, prefix: '' }];

    while (stack.length > 0) {
        const { obj, prefix } = stack.pop()!;

        for (const key of Object.keys(obj)) {
            const value = obj[key];
            const transformedKey = prefix !== "" ? prefix + delimiter + transformKey(key) : transformKey(key);

            if (typeof value !== "object" || value === null) {
                result.set(transformedKey, value as Primitive);
            } else if (Object.keys(value).length === 0) {
                continue;
            } else if (handledObjects.has(value as NestedObject)) {
                throw new CircularReferenceError(transformedKey);
            } else {
                stack.push({ obj: value as NestedObject, prefix: transformedKey });
                handledObjects.add(value as NestedObject);
            }
        }
    }

    return result;
}

function getKey(key: string): string | number {
    const parsedKey = Number(key);

    if (isNaN(parsedKey) || key.indexOf('.') !== -1) {
        return key;
    }

    return parsedKey;
}

function isEmpty(value: unknown): boolean {
    if (Array.isArray(value)) {
        return value.length === 0;
    } else if (typeof value === "object" && value !== null) {
        return Object.keys(value).length === 0;
    }

    return false;
}

export function unflatten(target: Map<string, unknown>, options: FlattenOptions = {}): NestedObject {
    const delimiter = options.delimiter ?? '.';
    const transformKey = options.transformKey ?? ((key) => key);
    const result: NestedObject = {};

    for (const [key, value] of target.entries()) {
        const keys = key.split(delimiter).map(transformKey);
        let currentObj = result;

        for (let i = 0; i < keys.length; i++) {
            const currentKey = getKey(keys[i]);

            if (i === keys.length - 1) {
                currentObj[currentKey] = value;
            } else {
                const nextKey = getKey(keys[i + 1]);

                if (!(currentKey in currentObj)) {
                    currentObj[currentKey] = typeof nextKey === 'number' ? [] : {};
                } else if (isEmpty(currentObj[currentKey])) {
                    currentObj[currentKey] = typeof nextKey === 'number' ? [] : {};
                }

                currentObj = currentObj[currentKey] as NestedObject;
            }
        }
    }

    return result;
}