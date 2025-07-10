import { db } from "@ziron/db";
import { notificationsTable } from "@ziron/db/schema";
import { JobData, JobType } from "@ziron/queue";
import redis from "@ziron/redis";
import { NotificationPayloadSchema } from "@ziron/validators";

export const runNotification = async (data: JobData[JobType.Notification]) => {
  const result = NotificationPayloadSchema.safeParse(data);
  if (!result.success) {
    console.error("Invalid notification job:", result.error);
    return;
  }

  console.log("result: ", result);

  const { userId, message, type } = result.data;

  await db.insert(notificationsTable).values({ userId, message, type });

  // Send live notification via Redis pub/sub
  await redis.publish(
    "notifications",
    JSON.stringify({ userId, type, message }),
  );
};
