import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { initAuth } from "@ziron/auth";

import { env } from "@/lib/env/server";
import { invalidateUserCaches } from "@/modules/users/actions/cache";

const baseUrl = env.BETTER_AUTH_ALLOWED_ORIGIN;

export const auth = initAuth({
  baseUrl,
  productionUrl: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  afterEmailVerification: async (email) => {
    await invalidateUserCaches(undefined, email);
  },
});

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));
export type ErrorCode = keyof typeof auth.$ERROR_CODES | "UNKNOWN";
