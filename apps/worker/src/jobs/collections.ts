import { db, eq, lt } from "@ziron/db";
import { collectionsTable, users } from "@ziron/db/schema";
import { enqueue, JobType } from "@ziron/queue";

export const deleteSoftDeletedCollections = async () => {
  const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await db.delete(collectionsTable).where(lt(collectionsTable.deletedAt, THIRTY_DAYS_AGO)).returning();
  console.log("Hard-deleted collections soft-deleted over 30 days ago:", result);

  // Send notification to admin users for each collection separately
  if (result.length > 0) {
    // Get all admin users
    const adminUsers = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));

    // Send notification to each admin user for each collection
    for (const adminUser of adminUsers) {
      for (const collection of result) {
        await enqueue(JobType.Notification, {
          userId: adminUser.id,
          type: "system",
          message: `Collection "${collection.title}" has been permanently removed from the system after being in the trash for over 30 days.`,
        });
      }
    }

    console.log(`Sent ${result.length * adminUsers.length} notifications to ${adminUsers.length} admin users`);
  }
};
