import * as z from "zod";
import "dotenv/config"

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  AWS_REGION: z.string(),
  DYNAMODB_TABLE: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
