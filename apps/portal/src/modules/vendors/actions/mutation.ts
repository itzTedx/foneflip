"use server";

import { addHours } from "date-fns";

import { db } from "@ziron/db";
import { sendEmail } from "@ziron/email";
import VerificationEmail from "@ziron/email/templates/onboarding/token-verification";
import { invitationSchema, z } from "@ziron/validators";

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
    log.warn("Validation failed for upsertCollection", { error });
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

    const hours = expiryMap[expiresIn as keyof typeof expiryMap] || 1;
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
          expiresIn: expiresIn ?? "1",
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
  } catch {
    log.error("Send invitation action failed", { error });
    return {
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to send invitation",
    };
  }
}
