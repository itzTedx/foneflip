import { emailOTPClient, inferAdditionalFields, passkeyClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { Auth } from "@ziron/auth";

export const authClient = createAuthClient({
  plugins: [passkeyClient(), emailOTPClient(), inferAdditionalFields<Auth>(), twoFactorClient()],
});

export const { signIn, signUp, signOut, useSession, twoFactor } = authClient;
export type ErrorTypes = keyof typeof authClient.$ERROR_CODES;
export type ActiveSession = typeof authClient.$Infer.Session;
