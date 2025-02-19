import { ConfigurationBuilder } from "@digitalbastion/dotconfig";
import { postgresConfigSchema } from "./configs/postgres.js";

const config = await new ConfigurationBuilder()
    .addEnvironmentVariables()
    .build();

const postgresConfig = await config.getSection("postgres").toObject(postgresConfigSchema);

console.log(postgresConfig);
/*
It will output:
```json
{
    connectionString: "postgres://localhost:5432",
    database: "mydb"
}
```
*/
