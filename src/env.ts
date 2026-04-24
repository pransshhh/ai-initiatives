import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().default(3001),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
