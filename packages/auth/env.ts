import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export function authEnv() {
  return createEnv({
    server: {
      BETTER_AUTH_SECRET: z.string().min(1),
      NODE_ENV: z.enum(["development", "production"]).optional(),
    },

    experimental__runtimeEnv: {},
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
