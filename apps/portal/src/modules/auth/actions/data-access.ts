import { redirect } from "next/navigation";

import { auth, getSession } from "@/lib/auth/server";

import "server-only";

import { PERMISSIONS } from "@ziron/auth/permission";

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

export type Resource = keyof typeof PERMISSIONS;
export type ActionFor<R extends Resource> = (typeof PERMISSIONS)[R][number];
export type PermissionMap = {
  [R in Resource]?: ActionFor<R>[];
};

interface HasPermissionOptions {
  permissions: PermissionMap;
  redirectTo?: string;
  throwOnFail?: boolean;
}

/**
 * Verifies that the current user has the specified permissions, redirecting or throwing an error if not.
 *
 * If the user lacks the required permissions, either throws an "Unauthorized" error or redirects to a specified URL, depending on options.
 *
 * @param permissions - The required permissions to check for the user
 * @param redirectTo - Optional URL to redirect to if permission is denied (defaults to "/")
 * @param throwOnFail - If true, throws an error instead of redirecting on failure (defaults to false)
 * @returns An object containing the user session and the permission check response if access is granted
 */
export async function hasPermission({ permissions, redirectTo = "/", throwOnFail = false }: HasPermissionOptions) {
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
