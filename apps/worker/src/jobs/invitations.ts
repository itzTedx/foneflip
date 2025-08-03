import { vendorInvitations } from "@ziron/db/schema";
import { and, db, eq, isNull, lt } from "@ziron/db/server";
import { enqueue, JobType } from "@ziron/queue";

import { publishInvitationUpdateRedundant } from "../../../portal/src/modules/vendors/utils/invitation-updates";

export const updateExpiredInvitations = async () => {
  console.log("Starting updateExpiredInvitations job...");

  try {
    // Find all pending invitations that have expired
    const expiredInvitations = await db
      .select()
      .from(vendorInvitations)
      .where(
        and(
          eq(vendorInvitations.status, "pending"),
          lt(vendorInvitations.expiresAt, new Date()),
          isNull(vendorInvitations.deletedAt)
        )
      );

    console.log(`Found ${expiredInvitations.length} expired invitations`);

    // Update each expired invitation
    for (const invitation of expiredInvitations) {
      const [updated] = await db
        .update(vendorInvitations)
        .set({
          status: "expired",
          updatedAt: new Date(),
        })
        .where(eq(vendorInvitations.id, invitation.id))
        .returning();

      if (updated) {
        console.log(`Updated invitation ${updated.id} to expired status`);

        // Publish real-time update
        try {
          await publishInvitationUpdateRedundant({
            invitationId: updated.id,
            status: "expired",
            expiresAt: updated.expiresAt,
          });
          console.log(`Published real-time update for expired invitation ${updated.id}`);
        } catch (updateError) {
          console.error(`Failed to publish real-time update for invitation ${updated.id}:`, updateError);
        }

        // Send notification to admin if sentByAdminId exists
        if (updated.sentByAdminId) {
          try {
            await enqueue(JobType.Notification, {
              userId: updated.sentByAdminId,
              type: "invitation_expired",
              message: `Invitation for ${updated.vendorEmail} has expired`,
            });
            console.log(`Sent notification for expired invitation ${updated.id} to admin ${updated.sentByAdminId}`);
          } catch (notificationError) {
            console.error(`Failed to send notification for expired invitation ${updated.id}:`, notificationError);
          }
        } else {
          console.log(`Skipping notification for expired invitation ${updated.id} - no sentByAdminId found`);
        }
      }
    }

    console.log("updateExpiredInvitations job completed successfully");
  } catch (error) {
    console.error("Error in updateExpiredInvitations job:", error);
    throw error;
  }
};
