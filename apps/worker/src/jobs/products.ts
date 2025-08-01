import { db, eq, lt } from "@ziron/db";
import { productsTable, users } from "@ziron/db/schema";
import { enqueue, JobType } from "@ziron/queue";

export const deleteSoftDeletedProducts = async () => {
  console.log("Starting deleteSoftDeletedProducts job...");

  const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  console.log(`Looking for products soft-deleted before: ${THIRTY_DAYS_AGO.toISOString()}`);

  try {
    await db.transaction(async (tx) => {
      const result = await tx.delete(productsTable).where(lt(productsTable.deletedAt, THIRTY_DAYS_AGO)).returning({
        id: productsTable.id,
        title: productsTable.title,
        slug: productsTable.slug,
      });

      console.log(`Hard-deleted ${result.length} products soft-deleted over 30 days ago:`, result);

      // Send notification to admin users for each product separately
      if (result.length > 0) {
        // Get all admin users
        const adminUsers = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));

        console.log(`Found ${adminUsers.length} admin users to notify`);

        // Send notification to each admin user for each product
        for (const adminUser of adminUsers) {
          for (const product of result) {
            await enqueue(JobType.Notification, {
              userId: adminUser.id,
              type: "system",
              message: `Product "${product.title}" has been permanently removed from the system after being in the trash for over 30 days.`,
            });
          }
        }

        console.log(`Sent ${result.length * adminUsers.length} notifications to ${adminUsers.length} admin users`);
      } else {
        console.log("No products found to permanently delete");
      }
    });
  } catch (error) {
    console.error("Error in deleteSoftDeletedProducts:", error);
    throw error;
  }
};
