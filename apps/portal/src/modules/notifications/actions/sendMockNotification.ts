"use server";

import { enqueue, JobType } from "@ziron/queue";

export async function sendMockNotification(userId: string) {
  await enqueue(JobType.Notification, {
    userId,
    type: "mock",
    message: "This is a mock notification!",
  });
}
