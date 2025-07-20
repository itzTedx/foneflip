import { db, lt } from "@ziron/db";
import { collectionsTable } from "@ziron/db/schema";

export const deleteSoftDeletedCollections = async () => {
  const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await db
    .delete(collectionsTable)
    .where(lt(collectionsTable.deletedAt, THIRTY_DAYS_AGO))
    .returning();
  console.log(
    `Hard-deleted collections soft-deleted over 30 days ago:`,
    result,
  );
};
