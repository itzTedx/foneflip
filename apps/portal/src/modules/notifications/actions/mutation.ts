"use server";

import { notificationsTable } from "@ziron/db/schema";
import { db, eq } from "@ziron/db/server";

export async function markAllNotificationsAsRead(userId: string) {
  return await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.userId, userId))
    .returning();
}

export async function markNotificationAsRead(notificationId: string) {
  return await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, notificationId))
    .returning();
}
