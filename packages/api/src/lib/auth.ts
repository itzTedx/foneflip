import { initAuth } from "@ziron/auth";

import { env } from "./env";

const baseUrl = env.BETTER_AUTH_ALLOWED_ORIGIN;

export const auth: ReturnType<typeof initAuth> = initAuth({
  baseUrl,
  productionUrl: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
});
