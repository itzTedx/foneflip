import redis from "@ziron/redis";

interface InvitationUpdate {
  invitationId: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  usedAt?: Date | null;
  revokedAt?: Date | null;
  expiresAt?: Date | null;
}

/**
 * Publishes an invitation status update to Redis for real-time notifications
 * @param update - The invitation update data
 */
export async function publishInvitationUpdate(update: InvitationUpdate) {
  try {
    await redis.publish("invitation-updates", JSON.stringify(update));
    console.log("Published invitation update to Redis:", update);
  } catch (error) {
    console.error("Failed to publish invitation update to Redis:", error);
  }
}

/**
 * Publishes an invitation update via HTTP to the WebSocket server
 * @param update - The invitation update data
 */
export async function publishInvitationUpdateViaHTTP(update: InvitationUpdate) {
  try {
    const wsServerUrl = "http://localhost:4000";
    const response = await fetch(`${wsServerUrl}/invitation-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Published invitation update via HTTP:", update);
  } catch (error) {
    console.error("Failed to publish invitation update via HTTP:", error);
  }
}

/**
 * Publishes an invitation update using both Redis and HTTP methods for redundancy
 * @param update - The invitation update data
 */
export async function publishInvitationUpdateRedundant(update: InvitationUpdate) {
  // Try both methods for redundancy
  await Promise.allSettled([publishInvitationUpdate(update), publishInvitationUpdateViaHTTP(update)]);
}
