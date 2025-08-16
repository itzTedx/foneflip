import { createEnv } from "@t3-oss/env-nextjs";

import { z } from "@ziron/validators";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_STORE_URL: z.string(),
  },

  emptyStringAsUndefined: true,
  experimental__runtimeEnv: {
    // biome-ignore lint/style/noProcessEnv: Needed for env validation
    NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL,
  },
});
