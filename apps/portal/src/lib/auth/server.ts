import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { env } from "@/lib/env/server";

import { initAuth } from "@ziron/auth";

const baseUrl =
  env.NODE_ENV === "production"
    ? `https://${env.PRODUCTION_URL}`
    : "http://localhost:3000";

export const auth = initAuth({
  baseUrl,
  productionUrl: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
