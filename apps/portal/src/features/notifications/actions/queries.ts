"use server";

import { and, db, desc, eq, isNull } from "@ziron/db";
import { notificationsTable } from "@ziron/db/schema";

export async function getNotifications(
  userId?: string,
  limit = 10,
  offset = 0,
) {
  if (userId)
    return db.query.notificationsTable.findMany({
      where: and(
        eq(notificationsTable.userId, userId),
        isNull(notificationsTable.deletedAt),
      ),
      orderBy: desc(notificationsTable.createdAt),
      limit,
      offset,
    });

  return null;
}
