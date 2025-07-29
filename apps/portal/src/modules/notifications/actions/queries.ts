"use server";

import { and, db, desc, eq, isNull } from "@ziron/db";
import { notificationsTable } from "@ziron/db/schema";

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
