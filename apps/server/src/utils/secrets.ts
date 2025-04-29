import { z, ZodError } from "zod";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

expand(config());

const EnvSchema = z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(6969),
});

export type Env = z.infer<typeof EnvSchema>;
let env: Env;

try {
  env = EnvSchema.parse(process.env);
} catch (e) {
  const error = e as ZodError;
  console.error("❌ Invalid environment variables:");
  console.error(error.flatten());
  process.exit(1);
}

export { env };
