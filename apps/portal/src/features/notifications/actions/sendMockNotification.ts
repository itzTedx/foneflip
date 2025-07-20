"use server";

import { asc, db, eq } from "@ziron/db";
import { notificationsTable } from "@ziron/db/schema";
import { enqueue, JobType } from "@ziron/queue";

export async function sendMockNotification(userId: string) {
  await enqueue(JobType.Notification, {
    userId,
    type: "mock",
    message: "This is a mock notification!",
  });
}

export async function getNotifications(userId: string) {
  return db.query.notificationsTable.findMany({
    where: eq(notificationsTable.userId, userId),
    orderBy: asc(notificationsTable.createdAt),
  });
}
