import { createEnv } from "@t3-oss/env-nextjs";

import { z } from "@ziron/validators";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url(),
  },

  emptyStringAsUndefined: true,
  experimental__runtimeEnv: {
    // biome-ignore lint/style/noProcessEnv: Needed for env validation
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  // biome-ignore lint/style/noProcessEnv: Needed for env validation
  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
