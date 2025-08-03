import { Queue, QueueEvents } from "bullmq";

import redis from "@ziron/redis";

// import { NotificationPayload } from "@ziron/validators";

export const QUEUE_NAME = "queue";
export const queue = new Queue(QUEUE_NAME, { connection: redis });

export enum JobType {
  Notification = "notification",
  DeleteSoftDeletedCollections = "delete-soft-deleted-collections",
  DeleteSoftDeletedProducts = "delete-soft-deleted-products",
  UpdateExpiredInvitations = "update-expired-invitations",
}

export type JobData = {
  [JobType.Notification]: { userId: string; type: string; message: string };
  [JobType.DeleteSoftDeletedCollections]: object;
  [JobType.DeleteSoftDeletedProducts]: object;
  [JobType.UpdateExpiredInvitations]: object;
};

export async function enqueue<T extends JobType>(type: T, data: JobData[T]) {
  return queue.add(type, data);
}

const queueEvents = new QueueEvents(QUEUE_NAME);
/**
 * Enqueues a job of the specified type and waits for its completion.
 *
 * @param type - The type of job to enqueue
 * @param data - The data associated with the job type
 * @returns The completed job after it has finished processing
 */
export async function enqueueAndWait<T extends JobType>(type: T, data: JobData[T]) {
  const job = await enqueue(type, data);
  await job.waitUntilFinished(queueEvents);
  return job;
}
