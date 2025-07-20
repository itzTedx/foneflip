import { and, db, eq, isNull, lt } from "@ziron/db";
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

  const { userId, message, type } = result.data;

  await db.insert(notificationsTable).values({ userId, message, type });

  // Send live notification via Redis pub/sub
  await redis.publish(
    "notifications",
    JSON.stringify({ userId, type, message }),
  );
};

export const deleteOldNotifications = async () => {
  const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const result = await db
    .update(notificationsTable)
    .set({ deletedAt: now })
    .where(
      and(
        lt(notificationsTable.createdAt, THIRTY_DAYS_AGO),
        eq(notificationsTable.read, true),
        isNull(notificationsTable.deletedAt),
      ),
    )
    .returning();
  console.log(`Soft-deleted notifications older than 30 days:`, result);
};

export const deleteSoftDeletedNotifications = async () => {
  const SIXTY_DAYS_AGO = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const result = await db
    .delete(notificationsTable)
    .where(lt(notificationsTable.deletedAt, SIXTY_DAYS_AGO))
    .returning();
  console.log(
    `Hard-deleted notifications soft-deleted over 2 months ago:`,
    result,
  );
};
