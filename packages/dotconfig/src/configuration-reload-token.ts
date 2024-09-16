import { EventEmitter } from "node:events";

export class ConfigurationReloadToken extends EventEmitter<{ reload: never[] }> {}
