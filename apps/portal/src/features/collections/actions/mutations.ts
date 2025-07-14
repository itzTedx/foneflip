"use server";

import { createLog } from "@/lib/utils";

import { db } from "@ziron/db/client";
import { collectionsTable } from "@ziron/db/schema";
import redis from "@ziron/redis";
import { slugify } from "@ziron/utils";
import { collectionSchema, z } from "@ziron/validators";

import { revalidateCollectionCaches } from "../utils/cache";

const log = createLog("Collection");

export async function upsertCollection(formData: unknown) {
  log.info("Received upsertCollection request", { formData });
  const { success, data, error } = collectionSchema.safeParse(formData);
  if (!success) {
    log.warn("Validation failed for upsertCollection", { error });
    return {
      success: false,
      error: "Invalid data",
      details: z.prettifyError(error),
    };
  }

  try {
    // --- Prepare collection data ---
    const collectionData: {
      title: string;
      description?: string;
      label?: string;
      slug: string;
      sortOrder?: number;
    } = {
      title: data.title,
      description: data.description,
      label: data.label,
      slug: data.slug ?? slugify(data.title),
      sortOrder: data.sortOrder,
    };

    log.info("Prepared collection data", { collectionData });

    log.info(
      "Performing upsert (insert on conflict do update) for collection",
      { slug: collectionData.slug },
    );
    const [collection] = await db
      .insert(collectionsTable)
      .values(collectionData)
      .onConflictDoUpdate({
        target: collectionsTable.id,
        set: {
          title: collectionData.title,
          description: collectionData.description,
          label: collectionData.label,
          sortOrder: collectionData.sortOrder,
          slug: collectionData.slug,
        },
      })
      .returning();

    log.info("Updating Redis cache for collection", {
      slug: collectionData.slug,
    });
    await redis.del(`collection:${collectionData.slug}`);
    await redis.setex(
      `collection:${collectionData.slug}`,
      3600,
      JSON.stringify(collection),
    );

    log.info("Revalidating collection caches", {
      id: collection?.id,
      slug: collectionData.slug,
    });
    revalidateCollectionCaches(collection?.id, collectionData.slug);

    log.info("upsertCollection succeeded", { collection });
    return {
      success: true,
      collection,
    };
  } catch (error) {
    log.error("upsertCollection failed", { error });
    return {
      success: false,
      error: "Database error",
      details: error instanceof Error ? error.message : error,
    };
  }
}
