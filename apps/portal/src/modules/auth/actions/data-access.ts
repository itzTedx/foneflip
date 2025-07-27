import { auth, getSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";

import "server-only";

export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  const role = session.user.role;

  const admin = role === "admin";
  const dev = role === "dev";

  if (!admin || !dev) {
    return {
      success: false,
      error: "Unauthorized",
      message: "User not authorized",
    };
  }
}

export const PERMISSIONS = {
  collections: ["create", "update", "delete"],
  products: ["create", "update", "delete"],
  cache: ["view"],
} as const;

export type Resource = keyof typeof PERMISSIONS;
export type ActionFor<R extends Resource> = typeof PERMISSIONS[R][number];
export type PermissionMap = {
  [R in Resource]?: ActionFor<R>[];
};

interface HasPermissionOptions {
  permissions: PermissionMap;
  redirectTo?: string;
  throwOnFail?: boolean; 
}

/**
 * Checks if the current user has the required permissions.
 * Redirects or throws based on the result.
 */
export async function hasPermission({
  permissions,
  redirectTo = "/",
  throwOnFail = false,
}: HasPermissionOptions) {
  const session = await requireUser();

  const res = await auth.api.userHasPermission({
    body: {
      role: session.user.role,
      permissions,
    },
  });

  if (!res.success) {
    if (throwOnFail) {
      throw new Error("Unauthorized");
    }

    redirect(redirectTo);
  }

  return { session, res };
}