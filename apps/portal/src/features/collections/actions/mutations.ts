"use server";

import { createLog } from "@/lib/utils";
import { eq } from "drizzle-orm";

import { db } from "@ziron/db";
import { collectionsTable } from "@ziron/db/schema";
import { slugify } from "@ziron/utils";
import { collectionSchema, z } from "@ziron/validators";

import {
  invalidateCollectionCaches,
  revalidateCollectionCaches,
} from "../utils/cache";
import { existingCollection, updateCollectionCache } from "./queries";

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
      id?: string;
      title: string;
      description?: string;
      label?: string;
      slug: string;
      sortOrder?: number;
    } = {
      id: data.id,
      title: data.title,
      description: data.description,
      label: data.label,
      slug: uniqueSlug,
      sortOrder: data.sortOrder,
    };

    log.info("Prepared collection data", { collectionData });

    // Optimistic cache update for existing collections
    if (data.id) {
      try {
        const optimisticData = {
          ...collectionData,
          id: data.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await updateCollectionCache(optimisticData as any, "update");
        log.info("Applied optimistic cache update", { id: data.id });
      } catch (cacheError) {
        log.warn("Optimistic cache update failed", { cacheError });
        // Continue with the operation - cache errors shouldn't break the main flow
      }
    }

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
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!collection) {
      throw new Error("Failed to upsert collection - no data returned");
    }

    // Update cache with the actual result
    try {
      await updateCollectionCache(collection, data.id ? "update" : "create");
      log.info("Updated cache with actual collection data", {
        id: collection.id,
        slug: collection.slug,
      });
    } catch (cacheError) {
      log.warn("Cache update failed after database operation", { cacheError });
      // Continue - cache errors shouldn't break the main flow
    }

    // Invalidate Next.js caches
    log.info("Invalidating Next.js caches", {
      id: collection.id,
      slug: collection.slug,
    });
    await invalidateCollectionCaches(collection.id, collection.slug);

    log.info("Revalidating collection caches", {
      id: collection.id,
      slug: collection.slug,
    });
    revalidateCollectionCaches(collection.id, collection.slug);

    log.info("upsertCollection succeeded", { collection });
    return {
      success: true,
      collection,
    };
  } catch (error) {
    log.error("upsertCollection failed", { error });

    // Revert optimistic cache updates on error
    if (data.id) {
      try {
        const baseSlug = data.slug ?? slugify(data.title);
        await invalidateCollectionCaches(data.id, baseSlug);
        log.info("Reverted optimistic cache updates due to error");
      } catch (cacheError) {
        log.warn("Failed to revert optimistic cache updates", { cacheError });
      }
    }

    return {
      success: false,
      error: "Database error",
      details: error instanceof Error ? error.message : error,
    };
  }
}

// Add delete collection function with proper caching
export async function deleteCollection(id: string) {
  log.info("Received deleteCollection request", { id });

  try {
    // Get the collection first for cache invalidation
    const collection = await db.query.collectionsTable.findFirst({
      where: eq(collectionsTable.id, id),
    });

    if (!collection) {
      return {
        success: false,
        error: "Collection not found",
      };
    }

    // Optimistic cache removal
    try {
      await updateCollectionCache(collection, "delete");
      log.info("Applied optimistic cache removal", { id });
    } catch (cacheError) {
      log.warn("Optimistic cache removal failed", { cacheError });
    }

    // Perform soft delete
    const [deletedCollection] = await db
      .update(collectionsTable)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(collectionsTable.id, id))
      .returning();

    if (!deletedCollection) {
      throw new Error("Failed to delete collection - no data returned");
    }

    // Invalidate all related caches
    log.info("Invalidating all collection caches after deletion", {
      id: deletedCollection.id,
      slug: deletedCollection.slug,
    });
    await invalidateCollectionCaches(
      deletedCollection.id,
      deletedCollection.slug,
    );

    log.info("deleteCollection succeeded", { deletedCollection });
    return {
      success: true,
      collection: deletedCollection,
    };
  } catch (error) {
    log.error("deleteCollection failed", { error });

    // Revert optimistic cache removal on error
    try {
      await invalidateCollectionCaches(id);
      log.info("Reverted optimistic cache removal due to error");
    } catch (cacheError) {
      log.warn("Failed to revert optimistic cache removal", { cacheError });
    }

    return {
      success: false,
      error: "Database error",
      details: error instanceof Error ? error.message : error,
    };
  }
}
