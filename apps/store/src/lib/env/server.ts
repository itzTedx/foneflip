import { createEnv } from "@t3-oss/env-nextjs";

import { authEnv } from "@ziron/auth/env";
import { z } from "@ziron/validators";

export const env = createEnv({
  extends: [authEnv()],
  server: {
    STORE_URL: z.string().min(1, "STORE_URL is required"),
    PORTAL_URL: z.string().min(1, "PORTAL_URL is required"),

    PRODUCTION_URL: z.string().min(1, "PRODUCTION_URL is required"),
  },

  emptyStringAsUndefined: true,

  // biome-ignore lint/style/noProcessEnv: Required for t3-env configuration
  experimental__runtimeEnv: process.env,
});
