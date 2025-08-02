import { NextResponse } from "next/server";

import { and, db, eq, gt, isNull, or } from "@ziron/db";
import { vendorInvitations } from "@ziron/db/schema";
import { z } from "@ziron/validators";

import { createLog } from "@/lib/utils";

const log = createLog("Vendor API");

// Define a schema for the token validation for better security
const tokenSchema = z.string().min(1, "Token is required");

// Custom error class for cleaner error handling
class InvitationError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "InvitationError";
  }
}

// Encapsulated business logic for better structure and testability
async function verifyAndUseInvitation(token: string) {
  return db.transaction(async (trx) => {
    const invitation = await trx.query.vendorInvitations.findFirst({
      where: and(
        eq(vendorInvitations.token, token),
        isNull(vendorInvitations.deletedAt),
        isNull(vendorInvitations.revokedAt),
        or(gt(vendorInvitations.expiresAt, new Date()), isNull(vendorInvitations.expiresAt))
      ),
    });

    if (!invitation) {
      throw new InvitationError("Invalid or expired token", 404);
    }

    if (invitation.usedAt) {
      throw new InvitationError("Invitation has already been used", 409);
    }

    const [updated] = await trx
      .update(vendorInvitations)
      .set({
        usedAt: new Date(),
        expiresAt: null,
        status: "accepted",
        updatedAt: new Date(),
      })
      .where(and(eq(vendorInvitations.id, invitation.id), isNull(vendorInvitations.usedAt)))
      .returning();

    if (!updated) {
      throw new InvitationError("Invitation has already been used", 409);
    }

    log.success("Marked invitation as used", { id: invitation.id });

    return updated;
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");

  try {
    // 1. Validate input
    const validatedToken = tokenSchema.parse(token);

    // 2. Execute business logic
    await verifyAndUseInvitation(validatedToken);

    // 3. Redirect to onboarding page on success
    const redirectUrl = new URL("/onboarding", origin);
    redirectUrl.searchParams.set("token", validatedToken);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    // 4. Handle errors gracefully - redirect to error page for all errors
    if (error instanceof z.ZodError) {
      log.warn("Validation error", { token, error: error.issues[0]?.message });
    } else if (error instanceof InvitationError) {
      log.warn(error.message, { token, status: error.status });
    } else {
      log.error("Failed to verify invitation", {
        error: error instanceof Error ? error.message : "Unknown error",
        token,
      });
    }

    // Redirect to error page for all types of errors with error details
    const errorUrl = new URL("/verify/error", origin);

    // Add error information to URL parameters
    if (error instanceof z.ZodError) {
      errorUrl.searchParams.set("type", "validation");
      errorUrl.searchParams.set("message", error.issues[0]?.message || "Invalid token format");
    } else if (error instanceof InvitationError) {
      errorUrl.searchParams.set("type", "invitation");
      errorUrl.searchParams.set("message", error.message);
      errorUrl.searchParams.set("status", error.status.toString());
    } else {
      errorUrl.searchParams.set("type", "server");
      errorUrl.searchParams.set("message", "An unexpected error occurred. Please try again later.");
    }

    return NextResponse.redirect(errorUrl);
  }
}
