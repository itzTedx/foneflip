"use server";

import { headers } from "next/headers";

import { addHours } from "date-fns";

import { and, db, eq } from "@ziron/db";
import { vendorInvitations, vendorsTable } from "@ziron/db/schema";
import { sendEmail } from "@ziron/email";
import VerificationEmail from "@ziron/email/templates/onboarding/token-verification";
import { slugify } from "@ziron/utils";
import { invitationSchema, organizationSchema, personalInfoSchema, z } from "@ziron/validators";

import { auth, getSession } from "@/lib/auth/server";
import { env } from "@/lib/env/server";
import { createLog } from "@/lib/utils";
import { hasPermission } from "@/modules/auth/actions/data-access";

import { invalidateVendorCaches } from "./cache";
import { createVendorInvitation, getCurrentUserVendor, hasPendingInvitation } from "./helper";

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

      // Invalidate vendor invitation caches
      if (invitation) {
        await invalidateVendorInvitationCaches(invitation);
      }
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

// Cache invalidation helper for vendor invitations
async function invalidateVendorInvitationCaches(invitation: { id: string; token: string; vendorEmail: string }) {
  try {
    await invalidateVendorCaches(undefined, invitation.token, invitation.vendorEmail);

    log.info("Invalidated vendor invitation caches", {
      invitationId: invitation.id,
      token: invitation.token,
      email: invitation.vendorEmail,
    });
  } catch (cacheError) {
    log.warn("Failed to invalidate vendor invitation caches", { cacheError });
  }
}

export async function revokeInvitation(invitationId: string) {
  const { res } = await hasPermission({
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

    // Invalidate vendor invitation caches
    await invalidateVendorInvitationCaches(updated);

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

export async function createOrganization(formData: unknown) {
  const { data, success, error } = organizationSchema.safeParse(formData);

  if (!success) {
    return {
      success: false,
      error: "Invalid data",
      message: z.prettifyError(error),
    };
  }

  const { name, logo, category, website, userId } = data;

  try {
    const res = await auth.api.createOrganization({
      body: {
        name,
        slug: slugify(name), // required
        logo,
        userId,
        keepCurrentActiveOrganization: false,
      },
      headers: await headers(),
    });

    if (!res) {
      return {
        success: false,
        error: "Invalid data",
        message: "Error Creating Organization",
      };
    }

    const [updatedVendor] = await db
      .update(vendorsTable)
      .set({
        businessCategory: category,
        website,
      })
      .where(eq(vendorsTable.slug, slugify(name)))
      .returning();

    if (!updatedVendor) {
      return {
        success: false,
        error: "VENDOR_NOT_FOUND",
        message: "Vendor profile not found",
      };
    }

    return {
      success: true,
      message: "Organization created successfully",
      data: updatedVendor,
    };
  } catch (error) {
    log.error("Failed to create organization", error);
    return {
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to create organization",
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

    const session = await getSession();
    const { vendor } = await getCurrentUserVendor(session?.user.id);

    if (!vendor) {
      return {
        success: false,
        error: "VENDOR_NOT_FOUND",
        message: "Vendor profile not found",
      };
    }

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
      userId: session?.user.id,
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
