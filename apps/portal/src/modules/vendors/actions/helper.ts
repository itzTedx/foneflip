import { and, eq, gt, isNotNull, isNull } from "@ziron/db";
import { vendorInvitations } from "@ziron/db/schema";
import { Trx } from "@ziron/db/types";

import { createLog } from "@/lib/utils";

import { generateInvitationToken } from "../utils/token";

const log = createLog("Vendor");
/**
 * Check if email already has a pending invitation
 */
export async function hasPendingInvitation(trx: Trx, email: string) {
  const existingInvitation = await trx.query.vendorInvitations.findFirst({
    where: and(
      eq(vendorInvitations.vendorEmail, email),
      isNull(vendorInvitations.deletedAt),
      isNull(vendorInvitations.revokedAt),
      isNull(vendorInvitations.usedAt),
      // Only consider invitations that have an expiration date and are not expired
      and(isNotNull(vendorInvitations.expiresAt), gt(vendorInvitations.expiresAt, new Date()))
    ),
  });

  return !!existingInvitation;
}

/**
 * Create a new vendor invitation
 */
export async function createVendorInvitation(
  trx: Trx,
  data: {
    name: string;
    vendorEmail: string;
    expiresAt: Date;
    sentByAdminId?: string;
    invitationType?: string;
  }
) {
  try {
    // Generate secure token
    const token = generateInvitationToken();

    const [invitation] = await trx
      .insert(vendorInvitations)
      .values({
        vendorName: data.name,
        vendorEmail: data.vendorEmail,
        token,
        expiresAt: data.expiresAt,
        sentByAdminId: data.sentByAdminId || null,
        invitationType: data.invitationType || "onboarding",
      })
      .returning();

    log.success("Created vendor invitation", {
      id: invitation?.id,
      email: data.vendorEmail,
    });

    return invitation;
  } catch (err) {
    log.error("Failed to create vendor invitation", err);
    throw err;
  }
}

// Common error handling wrapper
export const handleActionError = (error: unknown, actionName: string) => {
  log.error(`${actionName} action error:`, error);
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error occurred",
  };
};
