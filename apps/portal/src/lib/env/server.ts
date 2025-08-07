import { createEnv } from "@t3-oss/env-nextjs";

import { authEnv } from "@ziron/auth/env";
import { z } from "@ziron/validators";

export const env = createEnv({
  extends: [authEnv()],
  server: {
    DB_HOST: z.string().min(1),
    DB_PORT: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_NAME: z.string().min(1),

    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),

    REDIS_HOST: z.string().min(1),
    REDIS_PORT: z.string().min(1),
    REDIS_PASSWORD: z.string().min(1),

    PRODUCTION_URL: z.string().min(1),
    WS_SERVER_URL: z.string().min(1),

    AWS_BUCKET_NAME: z.string().min(1),
    AWS_BUCKET_REGION: z.string().min(1),
    AWS_ACCESS_KEY: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
  },

  createFinalSchema: (env) => {
    return z.object(env).transform((val) => {
      const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, ...rest } = val;

      return {
        ...rest,
        DATABASE_URL: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
      };
    });
  },
  emptyStringAsUndefined: true,

  // biome-ignore lint/style/noProcessEnv: Required for t3-env configuration
  experimental__runtimeEnv: process.env,
});
