// import { Worker } from "bullmq";

// import { JobType, QUEUE_NAME } from "@ziron/queue";
// import redis from "@ziron/redis";

// import { runNotification } from "./jobs/notifications";

// const runners = {
//   [JobType.Notifications]: runNotification,
// };

// new Worker(
//   QUEUE_NAME,
//   async (job) => {
//     const runner = runners[job.name as JobType];
//     if (!runner) {
//       console.error(`Unknown job type`, job.name);
//       throw new Error(`Unknown job type ${job.name}`);
//     }

//     console.log(`[${job.id}] ${job.name} - Running...`, job.data);
//     await runner(job.data);
//     console.log(`[${job.id}] ${job.name} - Completed`);
//   },
//   { connection: redis },
// );

import { Worker } from "bullmq";

import { db } from "@ziron/db";
import { notificationsTable } from "@ziron/db/schema";
import redis from "@ziron/redis";
import { NotificationPayloadSchema } from "@ziron/validators";

import "dotenv/config";

new Worker(
  "notifications",
  async (job) => {
    console.log("[Worker] Received job:", job.id, job.data);
    const parsed = NotificationPayloadSchema.safeParse(job.data);
    if (!parsed.success) {
      console.error("[Worker] Invalid notification payload:", parsed.error);
      return;
    }
    const { userId, message, type } = parsed.data;
    console.log(
      `[Worker] Inserting notification for userId: ${userId}, message: ${message}, type: ${type}`,
    );
    await db.insert(notificationsTable).values({
      userId,
      message,
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(
      `[Worker] Notification inserted. Publishing to Redis for userId: ${userId}`,
    );
    await redis.publish(
      "notifications",
      JSON.stringify({ userId, message, type }),
    );
    console.log(
      `[Worker] Notification published to Redis for userId: ${userId}`,
    );
  },
  { connection: redis },
);
