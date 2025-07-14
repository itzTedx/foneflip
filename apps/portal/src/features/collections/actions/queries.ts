import { eq } from "drizzle-orm";

import { db } from "@ziron/db/client";
import { collectionsTable } from "@ziron/db/schema";

export const existingCollection = async (slug: string) =>
  await db.query.collectionsTable.findFirst({
    where: eq(collectionsTable.slug, slug),
  });
