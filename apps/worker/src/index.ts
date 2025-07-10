import { Worker } from "bullmq";

import { JobType, QUEUE_NAME } from "@ziron/queue";
import redis from "@ziron/redis";

import { runNotification } from "./jobs/notifications";

const runners = {
  [JobType.Notification]: runNotification,
};

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
