import { Queue, Worker } from "bullmq";

import { JobType, QUEUE_NAME } from "@ziron/queue";
import redis from "@ziron/redis";

import { deleteSoftDeletedCollections } from "./jobs/collections";
import {
  deleteOldNotifications,
  deleteSoftDeletedNotifications,
  runNotification,
} from "./jobs/notifications";

const runners = {
  [JobType.Notification]: runNotification,
  deleteOldNotifications,
  deleteSoftDeletedNotifications,
  [JobType.DeleteSoftDeletedCollections]: deleteSoftDeletedCollections,
};

const queue = new Queue(QUEUE_NAME, { connection: redis });

(async () => {
  // Add a repeatable job to delete old notifications every day at midnight using BullMQ v5+ API
  await queue.upsertJobScheduler(
    "delete-old-notifications-scheduler", // unique scheduler id
    { pattern: "0 0 1 * *" }, // every 1st of the month at midnight (approx. every 30 days)
    {
      name: "deleteOldNotifications", // must match the handler name in runners
      data: {},
      opts: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    },
  );

  // Schedule hard deletion of soft-deleted notifications every 1st of the month at 1:00 AM
  await queue.upsertJobScheduler(
    "delete-soft-deleted-notifications-scheduler",
    { pattern: "0 1 1 * *" }, // every 1st of the month at 1:00 AM
    {
      name: "deleteSoftDeletedNotifications",
      data: {},
      opts: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    },
  );

  // Schedule hard deletion of soft-deleted collections every day at 2:00 AM
  await queue.upsertJobScheduler(
    "delete-soft-deleted-collections-scheduler",
    { pattern: "0 2 * * *" }, // every day at 2:00 AM
    {
      name: JobType.DeleteSoftDeletedCollections,
      data: {},
      opts: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    },
  );
})();

new Worker(
  QUEUE_NAME,
  async (job) => {
    const runner = runners[job.name as JobType];
    if (!runner) {
      console.error(`Unknown job type`, job.name);
      throw new Error(`Unknown job type ${job.name}`);
    }

    console.log(`[${job.id}] ${job.name} - Running...`, job.data);
    await runner(job.data);
    console.log(`[${job.id}] ${job.name} - Completed`);
  },
  { connection: redis },
);

console.log("hello world");
