import "server-only";

import { env } from "@/lib/env/server";
import { headers } from "next/headers";
import { cache } from "react";

import { initAuth } from "@ziron/auth";

const baseUrl = "http://localhost:3000";

export const auth = initAuth({
  baseUrl,
  productionUrl: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);
