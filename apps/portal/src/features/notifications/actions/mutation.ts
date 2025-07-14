"use server";

import { eq } from "drizzle-orm";

import { db } from "@ziron/db/client";
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
