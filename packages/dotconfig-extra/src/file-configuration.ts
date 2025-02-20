import { ConfigurationProvider } from "@digitalbastion/dotconfig/configuration-provider";
import { ConfigurationSource } from "@digitalbastion/dotconfig/configuration-source";
import { watch, type FSWatcher } from "chokidar";
import { readFile } from "node:fs/promises";
import { ConfigurationFileError } from "./errors.js";
import path from "node:path";

export interface FileConfigurationSourceOptions {
	optional?: boolean;
	reloadOnChange?: boolean;
}

export abstract class FileConfigurationSource extends ConfigurationSource {
	constructor(path: string, options: FileConfigurationSourceOptions = {}) {
		super();
		this.#path = path;
		this.#reloadOnChange = options.reloadOnChange ?? false;
		this.#optional = options.optional ?? false;
	}

	#path: string;
	#reloadOnChange: boolean;
	#optional: boolean;

	public get path(): string {
		return this.#path;
	}

	public get reloadOnChange(): boolean {
		return this.#reloadOnChange;
	}

	public get optional(): boolean {
		return this.#optional;
	}

	public abstract override build(): Promise<FileConfigurationProvider>;
}

export abstract class FileConfigurationProvider
	extends ConfigurationProvider
	implements AsyncDisposable
{
	constructor(source: FileConfigurationSource) {
		super();
		this.#source = source;
		this.#filePath = path.resolve(process.cwd(), this.#source.path);
	}

	#source: FileConfigurationSource;
	#filePath: string;
	#watcher?: FSWatcher | null;

	public get source(): FileConfigurationSource {
		return this.#source;
	}

	private async readConfigurationFile(): Promise<void> {
		try {
			const data = await readFile(this.#filePath, "utf8");
			await this.loadData(data);
		} catch (error) {
			if (!this.#source.optional) {
				throw new ConfigurationFileError(
					`Failed to read configuration file: ${this.#source.path}`,
					{ cause: error },
				);
			}
			this.data.clear();
		}
	}

	public override async load(): Promise<void> {
		await this.readConfigurationFile();

		if (this.#source.reloadOnChange) {
			const onChange = async () => {
				await this.readConfigurationFile();
				this.onReload();
			};

			this.#watcher = watch(this.#filePath, { ignoreInitial: true })
				.on("add", onChange)
				.on("change", onChange)
				.on("unlink", onChange)
				.on("error", (error) => {
					if (!this.#source.optional) {
						throw new ConfigurationFileError(
							`Failed to watch configuration file: ${this.#source.path}`,
							{ cause: error },
						);
					}
				});
		}
	}

	protected abstract loadData(data: string): Promise<void>;

	async [Symbol.asyncDispose](): Promise<void> {}
}
