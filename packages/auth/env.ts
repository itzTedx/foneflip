import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

/**
 * Creates and returns an environment configuration object for authentication, validating required server environment variables.
 *
 * The configuration enforces that `BETTER_AUTH_SECRET` is a non-empty string and optionally accepts `NODE_ENV` as either "development" or "production". Validation is skipped when running in CI or during linting.
 *
 * @returns The environment configuration object with validation rules applied.
 */
export function authEnv() {
  return createEnv({
    server: {
      BETTER_AUTH_SECRET: z.string().min(1),
      BETTER_AUTH_ALLOWED_ORIGIN: z.string().min(1),
      BETTER_AUTH_URL: z.string().min(1),
      NODE_ENV: z.enum(["development", "production"]).optional(),
    },

    experimental__runtimeEnv: {},
    skipValidation:
      // biome-ignore lint/style/noProcessEnv: Disabling validation while CI in process
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
