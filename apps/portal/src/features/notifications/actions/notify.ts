"use server";

import { Queue } from "bullmq";

import redis from "@ziron/redis";
import { NotificationPayloadSchema } from "@ziron/validators";

const notificationQueue = new Queue("notifications", {
  connection: redis,
});

export async function sendNotification(input: unknown) {
  const parsed = NotificationPayloadSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid notification input");
  }

  await notificationQueue.add("send", parsed.data);
}
