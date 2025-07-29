"use server";

import { and, db, desc, eq, isNull } from "@ziron/db";
import { notificationsTable } from "@ziron/db/schema";

/**
 * Retrieves a paginated list of notifications for a user, serializing date fields to ISO strings.
 *
 * @param userId - The ID of the user whose notifications are to be fetched. If not provided, returns null.
 * @param limit - The maximum number of notifications to return. Defaults to 10.
 * @param offset - The number of notifications to skip for pagination. Defaults to 0.
 * @returns An array of notifications with date fields as ISO strings, or null if no userId is provided.
 */
export async function getNotifications(
  userId?: string,
  limit = 10,
  offset = 0
) {
  if (userId) {
    const notifications = await db.query.notificationsTable.findMany({
      where: and(
        eq(notificationsTable.userId, userId),
        isNull(notificationsTable.deletedAt)
      ),
      orderBy: desc(notificationsTable.createdAt),
      limit,
      offset,
    });

    // Serialize Date objects to ISO strings for Next.js serialization
    return notifications.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
      deletedAt: notification.deletedAt?.toISOString() || null,
    }));
  }

  return null;
}
