import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { vendorInvitations } from "@ziron/db/schema";
import { and, db, eq, gt, isNull, or } from "@ziron/db/server";
import { z } from "@ziron/validators";

import { storeError } from "@/lib/error-handler";
import { createLog } from "@/lib/utils";
import { invalidateInvitationAfterVerification, invalidateVendorCaches } from "@/modules/vendors/actions/cache";
import { publishInvitationUpdateRedundant } from "@/modules/vendors/utils/invitation-updates";

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

    // Invalidate invitation caches after successful verification
    try {
      await invalidateInvitationAfterVerification(updated.token, updated.vendorEmail);
      log.info("Successfully invalidated invitation caches after verification", {
        invitationId: updated.id,
        token: updated.token,
        email: updated.vendorEmail,
      });
    } catch (cacheError) {
      log.warn("Failed to invalidate caches after verification", { cacheError });
    }

    // Publish real-time update
    try {
      await publishInvitationUpdateRedundant({
        invitationId: updated.id,
        status: "accepted",
        usedAt: updated.usedAt,
        expiresAt: updated.expiresAt,
      });
      log.info("Successfully published real-time invitation update", {
        invitationId: updated.id,
        status: "accepted",
      });
    } catch (updateError) {
      log.warn("Failed to publish real-time invitation update", { updateError });
    }

    return updated;
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");

  try {
    // 1. Validate input
    const validatedToken = tokenSchema.parse(token);

    // 2. Execute business logic
    const verifiedInvitation = await verifyAndUseInvitation(validatedToken);

    // 3. Redirect to onboarding page on success
    const redirectUrl = new URL("/onboarding", origin);
    redirectUrl.searchParams.set("token", validatedToken);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    // 4. Handle errors gracefully with secure error storage
    let errorType: "validation" | "invitation" | "server" = "server";
    let errorMessage = "An unexpected error occurred";
    let errorStatus: number | undefined;
    let errorDetails: string | undefined;

    if (error instanceof z.ZodError) {
      errorType = "validation";
      errorMessage = "Invalid token format";
      errorDetails = error.issues[0]?.message;
      log.warn("Validation error", { token, error: errorDetails });
    } else if (error instanceof InvitationError) {
      errorType = "invitation";
      errorMessage = error.message;
      errorStatus = error.status;
      log.warn(error.message, { token, status: error.status });
    } else {
      errorMessage = error instanceof Error ? error.message : "Unknown error";
      log.error("Failed to verify invitation", {
        error: errorMessage,
        token,
      });
    }

    // Invalidate caches even on error to ensure consistency
    if (token) {
      try {
        // Try to invalidate invitation caches for the token
        // Note: We don't have the email here, so we'll just invalidate the token-based caches
        await invalidateVendorCaches(undefined, token, undefined);
        log.info("Successfully invalidated token-based caches on error", { token });
      } catch (cacheError) {
        log.warn("Failed to invalidate caches on error", { cacheError, token });
      }
    }

    // Store error securely and get error ID
    const errorId = storeError(errorType, errorMessage, errorDetails, errorStatus, "medium", userAgent || undefined);

    // Redirect to error page with only the error ID
    const errorUrl = new URL("/verify/error", origin);
    errorUrl.searchParams.set("id", errorId);

    return NextResponse.redirect(errorUrl);
  }
}
