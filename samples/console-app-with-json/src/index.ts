import { ConfigurationBuilder } from "@digitalbastion/dotconfig";
import { JsonConfigurationSource } from "@digitalbastion/dotconfig-extra/providers/json.js";
import { postgresConfigSchema } from "./configs/postgres.js";
import { ParseErrors } from "@digitalbastion/dotconfig/errors";

const config = await new ConfigurationBuilder()
	.add(new JsonConfigurationSource("config.json", { reloadOnChange: true }))
	.build();

const postgresConfigSection = config.getSection("postgres");

const postgresConfig =
	await postgresConfigSection.toObject(postgresConfigSchema);

console.log(postgresConfig);

postgresConfigSection.getReloadToken().registerChangeCallback(async () => {
	try {
		const postgresConfig =
			await postgresConfigSection.toObject(postgresConfigSchema);

		console.log(postgresConfig);
	} catch (error) {
		console.error(error);
	}
});

while (true) {
	await new Promise((resolve) => setTimeout(resolve, 1000));
}
