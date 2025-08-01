import { createEnv } from "@t3-oss/env-core";

import { z } from "@ziron/validators";

export const env = createEnv({
  server: {
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.number().min(1),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    SMTP_FROM: z.email().min(1),
  },

  // biome-ignore lint/style/noProcessEnv: Required for t3-env configuration
  runtimeEnv: process.env,
});
