import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, emailOTP, organization, twoFactor } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

import { db } from "@ziron/db/server";
import { sendEmail } from "@ziron/email";
import EmailVerification from "@ziron/email/templates/auth/email-verification";
import redis from "@ziron/redis";

import { OTP_EXPIRES_IN, OTP_EXPIRES_IN_MS } from "./data/constants";
import { sendOTPEmail } from "./email/email-otp";
import { ac, admin, dev, user, vendor } from "./permission";

/**
 * Initializes and configures the authentication system for the application.
 *
 * Sets up authentication with PostgreSQL and Redis, enables plugins for organizations, admin roles, two-factor authentication, and email OTP, and configures rate limiting, session caching, and trusted origins.
 *
 * @param options - Contains the base URL, production URL, and secret for authentication configuration.
 * @returns The initialized authentication instance.
 */
export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
  plugins?: BetterAuthPlugin[];
  afterEmailVerification?: (email: string) => Promise<void>;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
      usePlural: true,
    }),

    appName: "Foneflip",
    emailAndPassword: {
      enabled: true,
      revokeSessionsOnPasswordReset: true,
    },

    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        try {
          await sendEmail({
            email: user.email,
            subject: "Verify your email address",
            react: EmailVerification({ verificationUrl: url }),
          });
        } catch (error) {
          console.error("Failed to send OTP email:", error instanceof Error ? error.message : error);
          throw new Error("Failed to send verification email");
        }
      },
      afterEmailVerification: async (user) => {
        await options.afterEmailVerification?.(user.email);
      },
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
      passkey(),
      organization({
        schema: {
          member: {
            fields: {
              organizationId: "vendorId",
            },
          },
          organization: {
            modelName: "vendor",
            fields: {
              name: "businessName",
            },
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
        expiresIn: OTP_EXPIRES_IN_MS,

        async sendVerificationOTP({ email, otp, type }) {
          try {
            // Query the database to get user information
            const user = await db.query.users.findFirst({
              where: (users, { eq }) => eq(users.email, email),
              columns: {
                id: true,
                email: true,
                name: true,
              },
            });

            await sendOTPEmail({
              to: email,
              otp,
              type: type,
              name: user?.name ?? "User",
              expiresIn: OTP_EXPIRES_IN,
            });
          } catch (error) {
            console.error("Failed to send OTP email:", error instanceof Error ? error.message : "Unknown error");
            throw error instanceof Error ? error : new Error("Failed to send verification email");
          }
        },
      }),
    ],
    secondaryStorage: {
      get: async (key) => {
        const value = await redis.get(`session:${key}`);
        return value ?? null;
      },
      set: async (key, value, ttl) => {
        if (ttl) await redis.setex(`session:${key}`, ttl, value);
        else await redis.set(`session:${key}`, value);
      },
      delete: async (key) => {
        await redis.del(`session:${key}`);
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
    trustedOrigins: [
      "expo://",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.0.206:3000",
      "http://192.168.1.158:3000",
      "http://192.168.1.215:3000",
      // Add your production domain here
      // "https://your-domain.com",
    ],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
export type User = Auth["$Infer"]["Session"]["user"];
export type ErrorCode = Auth["$ERROR_CODES"] | "UNKNOWN";
