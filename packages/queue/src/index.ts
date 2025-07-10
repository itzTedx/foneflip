import { Queue, QueueEvents } from "bullmq";

import redis from "@ziron/redis";
import { NotificationPayload } from "@ziron/validators";

export const QUEUE_NAME = "queue";
export const queue = new Queue(QUEUE_NAME, { connection: redis });

export enum JobType {
  GeneratePosts = "generate-posts",
  Notifications = "notifications",
}

export type JobData = {
  [JobType.GeneratePosts]: { count: number };
  [JobType.Notifications]: { notifications: NotificationPayload };
};

export async function enqueue<T extends JobType>(type: T, data: JobData[T]) {
  return queue.add(type, data);
}

const queueEvents = new QueueEvents(QUEUE_NAME);
export async function enqueueAndWait<T extends JobType>(
  type: T,
  data: JobData[T],
) {
  const job = await enqueue(type, data);
  await job.waitUntilFinished(queueEvents);
  return job;
}
