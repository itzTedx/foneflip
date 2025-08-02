"use server";

import { addHours } from "date-fns";

import { and, db, eq } from "@ziron/db";
import { vendorInvitations, vendorsTable } from "@ziron/db/schema";
import { sendEmail } from "@ziron/email";
import VerificationEmail from "@ziron/email/templates/onboarding/token-verification";
import { invitationSchema, personalInfoSchema, z } from "@ziron/validators";

import { env } from "@/lib/env/server";
import { createLog } from "@/lib/utils";
import { hasPermission } from "@/modules/auth/actions/data-access";

import { createVendorInvitation, hasPendingInvitation } from "./helper";

const log = createLog("Vendor");

// Common success response wrapper
const createSuccessResponse = <T>(data: T, message: string) => ({
  success: true,
  message,
  data,
});

export async function sendInvitation(formData: unknown) {
  const { res, session } = await hasPermission({
    permissions: {
      vendors: ["invite"],
    },
  });

  if (!res.success) {
    return {
      success: false,
      error: "UNAUTHORIZED",
      message: "You are not authorized to invite vendors",
    };
  }

  log.info("Received send invitation request", { formData });

  const { success, data, error } = invitationSchema.safeParse(formData);

  if (!success) {
    log.warn("Validation failed for sendInvitation", { error });
    return {
      success: false,
      error: "Invalid data",
      message: z.prettifyError(error),
    };
  }

  try {
    const { email, name, expiresIn } = data;
    log.info("Send invitation action started", { email, expiresIn });

    // Calculate expiry time with validation
    const expiryMap = {
      "1h": 1,
      "24h": 24,
      "48h": 48,
    } as const;

    const hours = expiryMap[expiresIn as keyof typeof expiryMap];
    if (!hours) {
      log.warn("Invalid expiresIn value, defaulting to 1 hour", { expiresIn });
      return {
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid expiration time",
      };
    }
    const expiresAt = addHours(new Date(), hours);
    const invitation = await db.transaction(async (trx) => {
      // Check if email already has a pending invitation
      const hasPending = await hasPendingInvitation(trx, email);
      if (hasPending) {
        throw new Error("Email already has a pending invitation");
      }

      // Create new invitation
      const newInvitation = await createVendorInvitation(trx, {
        name,
        vendorEmail: email,
        expiresAt,
        sentByAdminId: session.user.id,
        invitationType: "onboarding",
      });

      log.success("Transaction completed for invitation", newInvitation?.id);
      return newInvitation;
    });

    try {
      await sendEmail({
        email,
        subject: "Invitation to become a vendor on Foneflip",
        react: VerificationEmail({
          vendorName: name,
          verificationLink: `${env.BETTER_AUTH_URL}/verify?token=${invitation?.token}`,
          inviterName: session.user.name,
          expiresIn: hours.toString(),
        }),
      });
    } catch (error: unknown) {
      log.error("Failed to send email", { error });
      return {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Failed to send invitation",
      };
    }

    return createSuccessResponse(invitation, `Invitation sent to ${email}`);
  } catch (error) {
    log.error("Send invitation action failed", error);
    return {
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to send invitation",
    };
  }
}

export async function revokeInvitation(invitationId: string) {
  const { res, session } = await hasPermission({
    permissions: {
      vendors: ["invite"],
    },
  });

  if (!res.success) {
    return {
      success: false,
      error: "UNAUTHORIZED",
      message: "You are not authorized to revoke invitations",
    };
  }

  try {
    const [updated] = await db
      .update(vendorInvitations)
      .set({
        revokedAt: new Date(),
        status: "revoked",
        updatedAt: new Date(),
      })
      .where(eq(vendorInvitations.id, invitationId))
      .returning();

    if (!updated) {
      return {
        success: false,
        error: "NOT_FOUND",
        message: "Invitation not found",
      };
    }

    log.success("Revoked invitation", { id: invitationId });
    return createSuccessResponse(updated, "Invitation revoked successfully");
  } catch (error) {
    log.error("Failed to revoke invitation", error);
    return {
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to revoke invitation",
    };
  }
}

export async function updateExpiredInvitations() {
  try {
    const [updated] = await db
      .update(vendorInvitations)
      .set({
        status: "expired",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(vendorInvitations.status, "pending")
          // Add condition for expired invitations
          // This would need to be implemented based on your business logic
        )
      )
      .returning();

    log.success("Updated expired invitations", { invitationId: updated?.id });
    return createSuccessResponse(updated, "Expired invitations updated successfully");
  } catch (error) {
    log.error("Failed to update expired invitations", error);
    return {
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to update expired invitations",
    };
  }
}

// Update vendor personal information - Optimized with better validation
export const updateVendorPersonalInfoAction = async (formData: unknown) => {
  const { success, data, error } = personalInfoSchema.safeParse(formData);

  if (!success) {
    log.warn("Validation failed for updateVendorPersonalInfoAction", { error });
    return {
      success: false,
      error: "Invalid data",
      message: z.prettifyError(error),
    };
  }

  const { fullName, mobile, whatsapp, position } = data;

  try {
    log.info("Update vendor personal info action started", { fullName });

    const currentUser = await getAuthenticatedUser();
    const { vendor } = await getCurrentUserVendor(currentUser.userId);

    // Update vendor metadata with personal information
    const updatedVendor = await db
      .update(vendorsTable)
      .set({
        name: fullName,
        mobile,
        whatsapp,
        position,

        updatedAt: new Date(),
      })
      .where(eq(vendorsTable.id, vendor.id))
      .returning();

    log.success("Vendor personal info updated successfully", {
      vendorId: vendor.id,
      userId: currentUser.userId,
    });

    // Optimized cache revalidation. This now also revalidates the general vendors list
    // used on admin pages, by updating the underlying "PROFILE_ONLY" strategy.

    return createSuccessResponse(updatedVendor[0], "Personal information updated successfully");
  } catch (err) {
    log.error("Failed to update vendor personal info", err);
    return {
      success: false,
      error: "Invalid data",
      message: "Updating Vendor Information Failed",
    };
  }
};
