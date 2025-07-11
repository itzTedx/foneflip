"use server";

import { db, eq } from "@ziron/db";
import { notificationsTable } from "@ziron/db/schema";

export async function markAllNotificationsAsRead(userId: string) {
  return db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.userId, userId));
}

export async function markNotificationAsRead(notificationId: string) {
  return db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, notificationId));
}
