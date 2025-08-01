import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, emailOTP, organization, twoFactor } from "better-auth/plugins";

import { db } from "@ziron/db";
import redis from "@ziron/redis";

import { ac, admin, dev, user, vendor } from "./permission";

/**
 * Initializes and configures the authentication system for the application.
 *
 * Sets up authentication with PostgreSQL and Redis, enables plugins for organizations, admin roles, two-factor authentication, and email OTP, and configures rate limiting, session caching, and trusted origins.
 *
 * @param options - Contains the base URL, production URL, and secret for authentication configuration.
 * @returns The initialized authentication instance.
 */
export function initAuth(options: { baseUrl: string; productionUrl: string; secret: string | undefined }) {
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

    rateLimit: {
      enabled: true,
      window: 10, // time window in seconds
      max: 100, // max requests in the window
      storage: "secondary-storage",
    },

    user: {
      additionalFields: {
        role: {
          type: ["user", "vendor", "admin", "dev"],
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
      adminPlugin({
        ac,
        roles: {
          admin,
          user,
          vendor,
          dev,
        },
      }),
      nextCookies(),
      twoFactor(),
      emailOTP({
        async sendVerificationOTP() {
          // Implement the sendVerificationOTP method to send the OTP to the user's email address
        },
      }),
    ],
    secondaryStorage: {
      get: async (key) => {
        const value = await redis.get(key);
        return value ?? null;
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
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // Cache duration in seconds
      },
    },
    trustedOrigins: ["expo://", "http://localhost:3000", "http://192.168.0.206:3000", "http://192.168.1.158:3000"],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
