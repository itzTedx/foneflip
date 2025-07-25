import { redirect } from "next/navigation";
import { auth, getSession } from "@/lib/auth/server";

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

export async function canCollectionCreate() {
  const session = await requireUser();
  const res = await auth.api.userHasPermission({
    body: {
      // userId: session?.user.id,
      role: session?.user.role,
      permissions: {
        collections: ["create"], // This must match the structure in your access control
      },
    },
  });

  if (!res.success) redirect("/");
}
