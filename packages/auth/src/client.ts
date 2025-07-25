import {
  adminClient,
  emailOTPClient,
  inferAdditionalFields,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { ac, admin, dev, user, vendor } from "./permission";
import type { Auth } from "./server";

export const authClient = createAuthClient({
  plugins: [
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
