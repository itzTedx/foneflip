import { createEnv } from "@t3-oss/env-nextjs";

import { authEnv } from "@ziron/auth/env";

export const env = createEnv({
  extends: [authEnv()],

  // biome-ignore lint/style/noProcessEnv: Required for t3-env configuration
  experimental__runtimeEnv: process.env,
});
