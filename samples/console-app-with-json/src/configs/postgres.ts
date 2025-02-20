import { z } from 'zod';

export const postgresConfigSchema = z.object({
    connectionString: z.string().url(),
    database: z.string(),
});
