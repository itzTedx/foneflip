import { createEnv } from "@t3-oss/env-nextjs";

import { authEnv } from "@ziron/auth/env";
import { z } from "@ziron/validators";

export const env = createEnv({
  extends: [authEnv()],
  server: {
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_ALLOWED_ORIGIN: z.string().min(1),

    PRODUCTION_URL: z.string().min(1),

    NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  },

  emptyStringAsUndefined: true,

  // biome-ignore lint/style/noProcessEnv: Required for t3-env configuration
  experimental__runtimeEnv: process.env,
});
