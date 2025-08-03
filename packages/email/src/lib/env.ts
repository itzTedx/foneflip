import { createEnv } from "@t3-oss/env-nextjs";

import { z } from "@ziron/validators";

export const env = createEnv({
  server: {
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.string().min(1),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    SMTP_FROM: z.string().min(1),
    NODE_ENV: z.enum(["development", "production"]),
  },

  experimental__runtimeEnv: {},

  skipValidation:
    // biome-ignore lint/style/noProcessEnv: Disabling validation while CI in process
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
