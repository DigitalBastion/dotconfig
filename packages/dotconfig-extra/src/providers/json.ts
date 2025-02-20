import { ConfigurationFileError } from "../errors.js";
import {
	FileConfigurationProvider,
	FileConfigurationSource,
} from "../file-configuration.js";
import { flatten } from "@digitalbastion/dotconfig/utils";

export class JsonConfigurationSource extends FileConfigurationSource {
	public async build(): Promise<FileConfigurationProvider> {
		const provider = new JsonConfigurationProvider(this);
		await provider.load();

		return provider;
	}
}

export class JsonConfigurationProvider extends FileConfigurationProvider {
	protected override loadData(data: string): Promise<void> {
		try {
			const parsed = JSON.parse(data);
			const flattenObject = flatten(parsed, { delimiter: ":" });

			for (const [key, value] of flattenObject) {
				if (value === undefined) {
					continue;
				}
				if (value === null) {
					this.set(key, null);
				} else {
					this.set(key, String(value));
				}
			}
		} catch (error) {
			throw new ConfigurationFileError(
				`Failed to parse JSON configuration file: ${this.source.path}`,
				{ cause: error },
			);
		}

		return Promise.resolve();
	}
}
