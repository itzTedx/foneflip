import {
  adminClient,
  emailOTPClient,
  inferAdditionalFields,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { Auth } from "@ziron/auth";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    emailOTPClient(),
    inferAdditionalFields<Auth>(),
    twoFactorClient(),
  ],
});

export const { signIn, signUp, signOut, useSession, twoFactor } = authClient;
