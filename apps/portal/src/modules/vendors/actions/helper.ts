import { vendorInvitations } from "@ziron/db/schema";
import { and, db, eq, gt, isNotNull, isNull } from "@ziron/db/server";
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

/**
 * Get current user's vendor information
 */
export async function getCurrentUserVendor(userId?: string) {
  if (!userId) {
    return { vendor: null };
  }

  try {
    const memberRecord = await db.query.members.findFirst({
      where: (members, { eq }) => eq(members.userId, userId),
    });

    if (!memberRecord) {
      throw new Error("No vendor membership found for current user");
    }

    const vendor = await db.query.vendorsTable.findFirst({
      where: (vendors, { eq }) => eq(vendors.id, memberRecord.vendorId),
    });

    return { vendor };
  } catch (error) {
    log.error("Failed to get current user vendor", error);
    return { vendor: null };
  }
}

/**
 * Get vendor information by vendor ID
 */
export async function getVendorById(vendorId: string) {
  try {
    const vendor = await db.query.vendorsTable.findFirst({
      where: (vendors, { eq }) => eq(vendors.id, vendorId),
    });

    if (!vendor) {
      return { vendor: null };
    }

    // Get the vendor's email by finding the member relationship and user
    const memberRecord = await db.query.members.findFirst({
      where: (members, { eq }) => eq(members.vendorId, vendorId),
    });

    let vendorEmail: string | undefined | null = vendor.vendorEmail;

    if (!vendorEmail && memberRecord) {
      // If no vendorEmail in vendor table, get it from the user
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, memberRecord.userId),
      });
      vendorEmail = user?.email;
    }

    return {
      vendor: {
        ...vendor,
        email: vendorEmail,
      },
    };
  } catch (error) {
    log.error("Failed to get vendor by ID", error);
    return { vendor: null };
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
