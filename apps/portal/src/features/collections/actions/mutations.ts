"use server";

import { createLog } from "@/lib/utils";

import { db } from "@ziron/db/client";
import { collectionsTable } from "@ziron/db/schema";
import { slugify } from "@ziron/utils";
import { collectionSchema, z } from "@ziron/validators";

import {
  invalidateCollectionCaches,
  revalidateCollectionCaches,
} from "../utils/cache";
import { existingCollection } from "./queries";

const log = createLog("Collection");

// Helper function to generate a unique slug
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await existingCollection(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

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
    const baseSlug = data.slug ?? slugify(data.title);

    // Generate unique slug if it doesn't exist or if we're creating a new collection
    const uniqueSlug = await generateUniqueSlug(baseSlug);

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
      slug: uniqueSlug,
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
    await invalidateCollectionCaches(collection?.id, collectionData.slug);

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
