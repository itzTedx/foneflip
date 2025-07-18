import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, organization, twoFactor } from "better-auth/plugins";

import { db } from "@ziron/db/client";
import redis from "@ziron/redis";

export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
      usePlural: true,
    }),

    appName: "Foneflip",
    emailAndPassword: {
      enabled: true,
    },

    baseURL: options.baseUrl,
    secret: options.secret,

    user: {
      additionalFields: {
        role: {
          type: ["user", "vendor", "admin"],
          input: false,
        },
      },
    },

    plugins: [
      organization({
        schema: {
          organization: {
            modelName: "vendors",
          },
        },
      }),
      nextCookies(),
      twoFactor(),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          // Implement the sendVerificationOTP method to send the OTP to the user's email address
        },
      }),
    ],
    secondaryStorage: {
      get: async (key) => {
        const value = await redis.get(key);
        return value ? value : null;
      },
      set: async (key, value, ttl) => {
        if (ttl) await redis.setex(key, ttl, value);
        else await redis.set(key, value);
      },
      delete: async (key) => {
        await redis.del(key);
      },
    },
    advanced: {
      cookiePrefix: "foneflip",
      database: {
        generateId: false,
      },
    },
    trustedOrigins: [
      "expo://",
      "http://localhost:3000",
      "http://192.168.0.206:3000",
    ],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
