"use server";

import { asc, eq } from "drizzle-orm";

import { db } from "@ziron/db/client";
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
