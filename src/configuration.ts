import { DELIMITER } from "./constants";
import { unflatten } from "./utils/flatten";

export class Configuration {
    constructor(protected flatConfig = new Map<string, string>()) { }

    public toObject(): Record<string, unknown> | null {
        if (this.flatConfig.size === 0) {
            return null;
        }

        return unflatten(this.flatConfig, {
            delimiter: DELIMITER,
        });
    }
}
