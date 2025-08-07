import {
  adminClient,
  emailOTPClient,
  inferAdditionalFields,
  organizationClient,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { Auth } from "@ziron/auth";
import { ac, admin, dev, user, vendor } from "@ziron/auth/permission";

export const authClient = createAuthClient({
  plugins: [
    organizationClient(),
    passkeyClient(),
    adminClient({
      ac,
      roles: {
        admin,
        user,
        vendor,
        dev,
      },
    }),
    emailOTPClient(),
    inferAdditionalFields<Auth>(),
    twoFactorClient(),
  ],
});

export const { signIn, signUp, signOut, useSession, twoFactor } = authClient;
export type ErrorTypes = keyof typeof authClient.$ERROR_CODES;
export type ActiveSession = typeof authClient.$Infer.Session;
