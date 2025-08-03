"use server";

import { headers } from "next/headers";

import { addHours } from "date-fns";

import { and, db, eq, lt } from "@ziron/db";
import { member, users, vendorDocumentsTable, vendorInvitations, vendorsTable } from "@ziron/db/schema";
import { sendEmail } from "@ziron/email";
import VerificationEmail from "@ziron/email/templates/onboarding/token-verification";
import { slugify } from "@ziron/utils";
import { documentsSchema, invitationSchema, organizationSchema, personalInfoSchema, z } from "@ziron/validators";

import { auth, getSession } from "@/lib/auth/server";
import { env } from "@/lib/env/server";
import { createLog } from "@/lib/utils";
import { hasPermission } from "@/modules/auth/actions/data-access";

import { InvitationType } from "../types";
import { mapMimeTypeToDbFormat } from "../utils/detect-file-type";
import { publishInvitationUpdateRedundant } from "../utils/invitation-updates";
import { invalidateVendorCaches } from "./cache";
import { createVendorInvitation, getCurrentUserVendor, hasPendingInvitation } from "./helper";

const log = createLog("Vendor");

// Centralized response handling system
interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

type ErrorType =
  | "UNAUTHORIZED"
  | "UNAUTHENTICATED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "INTERNAL_SERVER_ERROR"
  | "VENDOR_NOT_FOUND"
  | "USER_NOT_FOUND"
  | "EMAIL_ALREADY_INVITED"
  | "INVALID_EXPIRATION"
  | "EMAIL_SEND_FAILED"
  | "DOCUMENT_UPLOAD_FAILED"
  | "ORGANIZATION_CREATION_FAILED";

// Centralized success response creator
const createSuccessResponse = <T>(data: T, message: string): ActionResponse<T> => ({
  success: true,
  message,
  data,
});

// Centralized error response creator
const createErrorResponse = (error: ErrorType, message: string, data?: unknown): ActionResponse => ({
  success: false,
  error,
  message,
  data,
});

// Centralized validation error handler
const handleValidationError = (error: z.ZodError): ActionResponse => {
  log.warn("Validation failed", { error });
  return createErrorResponse("VALIDATION_ERROR", z.prettifyError(error));
};

// Centralized permission check wrapper
const withPermissionCheck = async <T>(
  permissions: { vendors: ("create" | "update" | "delete" | "invite")[] },
  action: () => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> => {
  const { res } = await hasPermission({ permissions });

  if (!res.success) {
    return createErrorResponse("UNAUTHORIZED", "You are not authorized to perform this action") as ActionResponse<T>;
  }

  return action();
};

// Centralized error handler wrapper
const withErrorHandling = async <T>(
  actionName: string,
  action: () => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> => {
  try {
    return await action();
  } catch (error) {
    log.error(`${actionName} failed`, error);
    return createErrorResponse(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "An unexpected error occurred"
    ) as ActionResponse<T>;
  }
};

export async function sendInvitation(formData: unknown) {
  return withPermissionCheck({ vendors: ["invite"] }, async () => {
    log.info("Received send invitation request", { formData });

    const { success, data, error } = invitationSchema.safeParse(formData);
    if (!success) {
      return handleValidationError(error);
    }

    return withErrorHandling("Send invitation", async () => {
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
        log.warn("Invalid expiresIn value", { expiresIn });
        return createErrorResponse("INVALID_EXPIRATION", "Invalid expiration time");
      }

      const expiresAt = addHours(new Date(), hours);
      const { session } = await hasPermission({ permissions: { vendors: ["invite"] } });

      let invitation: InvitationType | undefined;

      try {
        // Create invitation in database
        invitation = await db.transaction(async (trx) => {
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

        // Optimistic cache update
        if (invitation) {
          try {
            await updateVendorInvitationCache({
              id: invitation.id!,
              token: invitation.token!,
              vendorEmail: invitation.vendorEmail,
              name: invitation.vendorName || "",
              expiresAt: invitation.expiresAt || new Date(),
              status: invitation.status || "pending",
            });
            log.info("Updated vendor invitation cache optimistically", {
              invitationId: invitation.id,
              token: invitation.token,
              email: invitation.vendorEmail,
            });
          } catch (cacheError) {
            log.warn("Failed to update vendor invitation cache optimistically", { cacheError });
          }
        }

        // Send email
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

        // Comprehensive cache invalidation after successful email send
        if (invitation?.id && invitation?.token && invitation?.vendorEmail) {
          try {
            // Invalidate vendor invitation caches
            await invalidateVendorInvitationCaches({
              id: invitation.id,
              token: invitation.token,
              vendorEmail: invitation.vendorEmail,
            });

            // Also invalidate general vendor caches since this affects the vendor ecosystem
            await invalidateVendorCaches();

            log.info("Successfully invalidated all vendor-related caches", {
              invitationId: invitation.id,
              token: invitation.token,
              email: invitation.vendorEmail,
            });
          } catch (cacheError) {
            log.warn("Failed to invalidate vendor caches after successful invitation", { cacheError });
          }
        }
      } catch (error: unknown) {
        log.error("Failed to send email", { error });

        // Rollback: Update invitation status to revoked if email failed
        if (invitation?.id) {
          try {
            await db
              .update(vendorInvitations)
              .set({
                status: "revoked",
                revokedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(vendorInvitations.id, invitation.id));

            log.warn("Rolled back invitation due to email failure", {
              invitationId: invitation.id,
              email,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          } catch (rollbackError) {
            log.error("Failed to rollback invitation after email failure", {
              invitationId: invitation.id,
              rollbackError,
            });
          }
        }

        return createErrorResponse("EMAIL_SEND_FAILED", "Failed to send invitation");
      }

      return createSuccessResponse(invitation, `Invitation sent to ${email}`);
    });
  });
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

// Optimistic cache update for vendor invitations
async function updateVendorInvitationCache(invitation: {
  id: string;
  token: string;
  vendorEmail: string;
  name: string;
  expiresAt: Date;
  status: string;
}) {
  try {
    const { redisCache, REDIS_KEYS } = await import("@/modules/cache");

    // Update invitation-specific caches
    await Promise.all([
      redisCache.set(REDIS_KEYS.VENDOR_INVITATION_BY_TOKEN(invitation.token), invitation, 3600), // 1 hour TTL
      redisCache.set(REDIS_KEYS.VENDOR_INVITATION_BY_EMAIL(invitation.vendorEmail), invitation, 3600),
    ]);

    // Invalidate the general invitations list cache
    await redisCache.del(REDIS_KEYS.VENDOR_INVITATIONS);

    log.info("Updated vendor invitation cache optimistically", {
      invitationId: invitation.id,
      token: invitation.token,
      email: invitation.vendorEmail,
    });
  } catch (cacheError) {
    log.warn("Failed to update vendor invitation cache optimistically", { cacheError });
  }
}

export async function revokeInvitation(invitationId: string) {
  return withPermissionCheck({ vendors: ["invite"] }, async () => {
    return withErrorHandling("Revoke invitation", async () => {
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
        return createErrorResponse("NOT_FOUND", "Invitation not found");
      }

      // Comprehensive cache invalidation
      try {
        // Invalidate vendor invitation caches
        await invalidateVendorInvitationCaches(updated);

        // Also invalidate general vendor caches since this affects the vendor ecosystem
        await invalidateVendorCaches();

        log.info("Successfully invalidated all vendor-related caches after revocation", {
          invitationId: updated.id,
          token: updated.token,
          email: updated.vendorEmail,
        });
      } catch (cacheError) {
        log.warn("Failed to invalidate vendor caches after revocation", { cacheError });
      }

      // Publish real-time update
      await publishInvitationUpdateRedundant({
        invitationId: updated.id,
        status: "revoked",
        revokedAt: updated.revokedAt,
        expiresAt: updated.expiresAt,
      });

      log.success("Revoked invitation", { id: invitationId });
      return createSuccessResponse(updated, "Invitation revoked successfully");
    });
  });
}

export async function updateExpiredInvitations() {
  return withErrorHandling("Update expired invitations", async () => {
    const [updated] = await db
      .update(vendorInvitations)
      .set({
        status: "expired",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(vendorInvitations.status, "pending"),
          lt(vendorInvitations.expiresAt, new Date())
          // This would need to be implemented based on your business logic
        )
      )
      .returning();

    if (updated) {
      // Invalidate vendor invitation caches for the updated invitation
      try {
        await invalidateVendorInvitationCaches(updated);
        log.info("Invalidated vendor invitation caches for expired invitation", {
          invitationId: updated.id,
          token: updated.token,
          email: updated.vendorEmail,
        });
      } catch (cacheError) {
        log.warn("Failed to invalidate vendor invitation caches for expired invitation", { cacheError });
      }
    }

    log.success("Updated expired invitations", { invitationId: updated?.id });
    return createSuccessResponse(updated, "Expired invitations updated successfully");
  });
}

export async function createOrganization(formData: unknown) {
  const { data, success, error } = organizationSchema.safeParse(formData);

  if (!success) {
    return handleValidationError(error);
  }

  return withErrorHandling("Create organization", async () => {
    const { name, logo, category, website, userId } = data;

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
      return createErrorResponse("ORGANIZATION_CREATION_FAILED", "Error Creating Organization");
    }

    // Get the current user's vendor information using the helper function
    const { vendor } = await getCurrentUserVendor(userId);

    if (!vendor) {
      return createErrorResponse("VENDOR_NOT_FOUND", "Vendor profile not found");
    }

    const [updatedVendor] = await db
      .update(vendorsTable)
      .set({
        businessCategory: category,
        website,
      })
      .where(eq(vendorsTable.id, vendor.id))
      .returning();

    if (!updatedVendor) {
      return createErrorResponse("VENDOR_NOT_FOUND", "Vendor profile not found");
    }

    return createSuccessResponse(updatedVendor, "Organization created successfully");
  });
}

export async function createAdminOrganization(formData: unknown) {
  const { data, success, error } = organizationSchema.safeParse(formData);

  if (!success) {
    return handleValidationError(error);
  }

  return withErrorHandling("Create admin organization", async () => {
    const { name, logo, category, website, userId } = data;

    // First, update the user's role to admin
    const [updatedUser] = await db
      .update(users)
      .set({
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return createErrorResponse("USER_NOT_FOUND", "User not found");
    }

    // Create the organization
    const res = await auth.api.createOrganization({
      body: {
        name,
        slug: slugify(name),
        logo,
        userId,
        keepCurrentActiveOrganization: false,
      },
      headers: await headers(),
    });

    if (!res) {
      return createErrorResponse("ORGANIZATION_CREATION_FAILED", "Error Creating Admin Organization");
    }

    // Check if vendor already exists by slug
    let vendor = await db.query.vendorsTable.findFirst({
      where: (v, { eq }) => eq(v.slug, slugify(name)),
    });

    if (!vendor) {
      // Create a new vendor profile for admin
      const [newVendor] = await db
        .insert(vendorsTable)
        .values({
          businessName: name,
          slug: slugify(name),
          logo,
          website,
          businessCategory: category,
          status: "approved", // Admin vendors are automatically approved
          approvedAt: new Date(),
          approvedBy: userId, // Self-approved for admin
        })
        .returning();

      vendor = newVendor;
    } else {
      // Update existing vendor profile to admin status
      const [updatedVendor] = await db
        .update(vendorsTable)
        .set({
          businessName: name,
          businessCategory: category,
          website,
          status: "approved",
          approvedAt: new Date(),
          approvedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(vendorsTable.id, vendor.id))
        .returning();

      vendor = updatedVendor;
    }

    if (!vendor) {
      return createErrorResponse("VENDOR_NOT_FOUND", "Failed to create or update vendor profile");
    }

    // Check if member relationship already exists
    const existingMember = await db.query.member.findFirst({
      where: (m, { and, eq }) => and(eq(m.userId, userId), eq(m.vendorId, vendor.id)),
    });

    if (!existingMember) {
      // Create member relationship with owner role
      await db.insert(member).values({
        userId,
        vendorId: vendor.id,
        role: "owner",
      });
    } else if (existingMember.role !== "owner") {
      // Update existing member to owner role
      await db.update(member).set({ role: "owner" }).where(eq(member.id, existingMember.id));
    }

    // Get the current member relationship for the response
    const currentMember = await db.query.member.findFirst({
      where: (m, { and, eq }) => and(eq(m.userId, userId), eq(m.vendorId, vendor.id)),
    });

    return createSuccessResponse(
      {
        vendor: {
          ...vendor,
          members: currentMember ? [currentMember] : [],
        },
        user: updatedUser,
      },
      "Admin organization created successfully"
    );
  });
}

// Update vendor personal information - Optimized with better validation
export const updateVendorPersonalInfoAction = async (formData: unknown) => {
  const { success, data, error } = personalInfoSchema.safeParse(formData);

  if (!success) {
    log.warn("Validation failed for updateVendorPersonalInfoAction", { error });
    return handleValidationError(error);
  }

  return withErrorHandling("Update vendor personal info", async () => {
    const { fullName, mobile, whatsapp, position } = data;

    log.info("Update vendor personal info action started", { fullName });

    const session = await getSession();
    const { vendor } = await getCurrentUserVendor(session?.user.id);

    if (!vendor) {
      return createErrorResponse("VENDOR_NOT_FOUND", "Vendor profile not found");
    }

    // Update vendor metadata with personal information
    const updatedVendor = await db
      .update(vendorsTable)
      .set({
        businessName: fullName,
        vendorNumber: mobile,
        vendorWhatsappNumber: whatsapp,
        vendorPosition: position,
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
  });
};

// Update vendor documents - Optimized with better validation
export async function updateVendorDocuments(formData: unknown) {
  const { success, data, error } = documentsSchema.safeParse(formData);

  if (!success) {
    log.warn("Validation failed for updateVendorDocuments", { error });
    return handleValidationError(error);
  }

  return withErrorHandling("Update vendor documents", async () => {
    const { tradeLicense, emiratesIdFront, emiratesIdBack } = data;

    log.info("Update vendor documents action started");

    if (!tradeLicense || !emiratesIdFront || !emiratesIdBack) {
      throw new Error("Trade license and Emirates ID (front and back) are required.");
    }

    const session = await getSession();
    if (!session?.user?.id) {
      return createErrorResponse("UNAUTHORIZED", "You must be logged in to update documents");
    }

    const { vendor } = await getCurrentUserVendor(session.user.id);
    if (!vendor) {
      return createErrorResponse("VENDOR_NOT_FOUND", "Vendor profile not found");
    }

    await db.transaction(async (trx) => {
      // Delete existing documents for this vendor
      await trx.delete(vendorDocumentsTable).where(eq(vendorDocumentsTable.vendorId, vendor.id));

      // Prepare documents to insert
      const documentsToInsert: (typeof vendorDocumentsTable.$inferInsert)[] = [
        {
          vendorId: vendor.id,
          documentType: "trade_license",
          url: tradeLicense.url,
          documentFormat: mapMimeTypeToDbFormat(tradeLicense.type),
        },
        {
          vendorId: vendor.id,
          documentType: "emirates_id_front",
          url: emiratesIdFront.url,
          documentFormat: mapMimeTypeToDbFormat(emiratesIdFront.type),
        },
        {
          vendorId: vendor.id,
          documentType: "emirates_id_back",
          url: emiratesIdBack.url,
          documentFormat: mapMimeTypeToDbFormat(emiratesIdBack.type),
        },
      ];

      // Insert all documents
      if (documentsToInsert.length > 0) {
        await trx.insert(vendorDocumentsTable).values(documentsToInsert);
      }

      // Update vendor status to pending approval
      await trx
        .update(vendorsTable)
        .set({ status: "pending_approval", updatedAt: new Date() })
        .where(eq(vendorsTable.id, vendor.id));
    });

    // Fetch updated vendor data
    const updatedVendor = await db.query.vendorsTable.findFirst({
      where: eq(vendorsTable.id, vendor.id),
    });

    log.success("Vendor documents updated successfully", {
      vendorId: vendor.id,
      userId: session.user.id,
    });

    // Revalidate vendor document caches
    try {
      await invalidateVendorCaches(vendor.id);
      log.info("Revalidated vendor document caches", { vendorId: vendor.id, type: "documents" });
    } catch (cacheError) {
      log.warn("Failed to revalidate vendor document caches", { cacheError });
    }

    return createSuccessResponse(updatedVendor, "Documents uploaded successfully");
  });
}
