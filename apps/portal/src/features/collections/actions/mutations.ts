"use server";

import { createLog } from "@/lib/utils";
import { eq } from "drizzle-orm";

import { db } from "@ziron/db";
import {
  collectionMediaTable,
  collectionSettingsTable,
  collectionsTable,
  collectionStatusEnum,
  seoTable,
} from "@ziron/db/schema";
import { slugify } from "@ziron/utils";
import { collectionSchema, z } from "@ziron/validators";

import {
  invalidateCollectionCaches,
  revalidateCollectionCaches,
} from "../utils/cache";
import { updateCollectionCache } from "./cache";
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
      message: z.prettifyError(error),
    };
  }

  try {
    return await db.transaction(async (tx) => {
      // --- Prepare collection data ---
      const baseSlug = data.slug ?? slugify(data.title);
      const uniqueSlug = await generateUniqueSlug(baseSlug);

      // --- Upsert SEO meta ---
      let seoId: string | undefined = undefined;
      if (data.meta) {
        let seoRow;
        if (data.id) {
          // Try to find existing SEO row by collection id
          const existing = await tx.query.collectionsTable.findFirst({
            where: eq(collectionsTable.id, data.id),
          });
          if (existing?.seoId) {
            // Update existing SEO row
            [seoRow] = await tx
              .update(seoTable)
              .set({
                metaTitle: data.meta.title,
                metaDescription: data.meta.description,
                keywords: data.meta.keywords,
                deletedAt: null,
                updatedAt: new Date(),
              })
              .where(eq(seoTable.id, existing.seoId))
              .returning();
          }
        }
        if (!seoRow) {
          // Insert new SEO row
          [seoRow] = await tx
            .insert(seoTable)
            .values({
              metaTitle: data.meta.title,
              metaDescription: data.meta.description,
              keywords: data.meta.keywords,
              deletedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();
        }
        if (!seoRow) {
          throw new Error("Failed to upsert SEO meta");
        }
        seoId = seoRow.id;
      }

      // --- Prepare collection data ---
      const collectionData: {
        id?: string;
        title: string;
        description?: string;
        label?: string;
        slug: string;
        sortOrder?: number;
        seoId?: string;
      } = {
        id: data.id,
        title: data.title,
        description: data.description,
        label: data.label,
        slug: uniqueSlug,
        sortOrder: data.sortOrder,
        seoId,
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
        }
      }

      log.info(
        "Performing upsert (insert on conflict do update) for collection",
        { slug: collectionData.slug },
      );
      const [collection] = await tx
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
            seoId: collectionData.seoId,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (!collection) {
        throw new Error("Failed to upsert collection - no data returned");
      }

      // --- Upsert collection settings ---
      if (data.settings) {
        const settingsData = {
          ...data.settings,
          collectionId: collection.id,
          deletedAt: null,
          updatedAt: new Date(),
        };
        // Try update first
        const [existingSettings] = await tx
          .update(collectionSettingsTable)
          .set(settingsData)
          .where(eq(collectionSettingsTable.collectionId, collection.id))
          .returning();
        if (!existingSettings) {
          // Insert if not exists
          await tx.insert(collectionSettingsTable).values({
            ...settingsData,
            createdAt: new Date(),
          });
        }
      }

      // Update cache with the actual result
      try {
        await updateCollectionCache(collection, data.id ? "update" : "create");
        log.info("Updated cache with actual collection data", {
          id: collection.id,
          slug: collection.slug,
        });
      } catch (cacheError) {
        log.warn("Cache update failed after database operation", {
          cacheError,
        });
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
    });
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
      message: error instanceof Error ? error.message : error,
    };
  }
}

export async function deleteCollection(id: string) {
  log.info("Received deleteCollection request", { id });

  try {
    return await db.transaction(async (tx) => {
      // Get the collection first for cache invalidation
      const collection = await tx.query.collectionsTable.findFirst({
        where: eq(collectionsTable.id, id),
      });

      if (!collection) {
        return {
          success: false,
          error: "Collection not found",
          message: "Collection not found",
        };
      }

      // Optimistic cache removal
      try {
        await updateCollectionCache(collection, "delete");
        log.info("Applied optimistic cache removal", { id });
      } catch (cacheError) {
        log.warn("Optimistic cache removal failed", { cacheError });
      }

      // Soft delete settings
      await tx
        .update(collectionSettingsTable)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(collectionSettingsTable.collectionId, id));

      // Soft delete SEO
      if (collection.seoId) {
        await tx
          .update(seoTable)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(eq(seoTable.id, collection.seoId));
      }

      // Perform soft delete
      const [deletedCollection] = await tx
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
    });
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
      message: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Set the status of a collection by updating its settings.
 * @param id - The collection ID
 * @param status - The new status to set
 */
export async function setCollectionStatus(
  id?: string,
  status?: (typeof collectionStatusEnum)["enumValues"][number],
) {
  try {
    if (!id) {
      log.warn(`Set status failed: ID not valid`);
      return {
        error:
          "Error updating collection status. Please contact technical support to fix this issue.",
      };
    }
    log.info(`Setting collection status to ${status} for ID: ${id}`);
    const collection = await db.query.collectionsTable.findFirst({
      where: eq(collectionsTable.id, id),
      columns: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (!collection) {
      log.warn(`Set status failed: Collection with ID ${id} not found.`);
      return { error: "Collection not found." };
    }

    await db
      .update(collectionSettingsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(collectionSettingsTable.collectionId, id));

    // Invalidate both Next.js and Redis caches
    await invalidateCollectionCaches(collection.id, collection.slug);
    log.info(
      `Successfully set collection status to ${status} for: "${collection.title}" (ID: ${id})`,
    );
    return {
      success: `Collection (${collection.title}) has been set to ${status}`,
      data: collection,
    };
  } catch (err) {
    log.error(`Error in setCollectionStatus action for ID: ${id}`, {
      error: err,
      message: err instanceof Error ? err.message : "Unknown error occurred",
      stack: err instanceof Error ? err.stack : undefined,
    });
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    return { error: `Failed to set collection status: ${message}` };
  }
}

/**
 * Update the sort order of multiple collections.
 * @param orders - Array of objects with id and sortOrder
 */
export async function updateCollectionsOrder({
  orders,
}: {
  orders: { id: string; sortOrder: number }[];
}) {
  try {
    log.info("Updating collections order", { orders });
    for (const { id, sortOrder } of orders) {
      await db
        .update(collectionsTable)
        .set({ sortOrder })
        .where(eq(collectionsTable.id, id));
    }
    // Invalidate both Next.js and Redis caches
    await invalidateCollectionCaches();
    log.info("Successfully updated collections order");
    return { success: true };
  } catch (err) {
    log.error("Error updating collection order", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Duplicate a collection, including its SEO, settings, and media, with a new slug and title.
 * @param id - The collection ID to duplicate
 */
export async function duplicateCollection(id: string) {
  log.info(`Duplicating collection with ID: ${id}`);
  try {
    // Fetch the original collection with relations
    const originalCollection = await db.query.collectionsTable.findFirst({
      where: eq(collectionsTable.id, id),
      with: {
        collectionMedia: true,
        seo: true,
        settings: true,
      },
    });

    if (!originalCollection) {
      log.warn(`Collection with ID ${id} not found for duplication`);
      return { error: "Collection not found" };
    }

    const duplicatedCollection = await db.transaction(async (trx) => {
      // Duplicate SEO
      let newSeoId: string | undefined = undefined;
      if (originalCollection.seo) {
        const [newSeo] = await trx
          .insert(seoTable)
          .values({
            metaTitle: originalCollection.seo.metaTitle || "",
            metaDescription: originalCollection.seo.metaDescription || "",
            keywords: originalCollection.seo.keywords || "",
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        if (!newSeo) {
          throw new Error("Failed to duplicate SEO meta");
        }
        newSeoId = newSeo!.id;
      }

      // Generate a unique slug for the duplicate
      const baseSlug = `${originalCollection.slug}-copy`;
      const uniqueSlug = await generateUniqueSlug(baseSlug);

      // Create new collection with duplicated data
      const [newCollection] = await trx
        .insert(collectionsTable)
        .values({
          title: `${originalCollection.title} (Copy)`,
          description: originalCollection.description,
          label: originalCollection.label,
          slug: uniqueSlug,
          sortOrder: (originalCollection.sortOrder || 0) + 1,
          seoId: newSeoId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      if (!newCollection) {
        throw new Error("Failed to duplicate collection - no data returned");
      }

      // Duplicate settings
      if (originalCollection.settings) {
        await trx.insert(collectionSettingsTable).values({
          collectionId: newCollection.id,
          status: "draft", // Always set duplicated collections as draft
          isFeatured: originalCollection.settings.isFeatured,
          layout: originalCollection.settings.layout,
          showLabel: originalCollection.settings.showLabel,
          showBanner: originalCollection.settings.showBanner,
          showInNav: originalCollection.settings.showInNav,
          tags: originalCollection.settings.tags,
          internalNotes: originalCollection.settings.internalNotes,
          customCTA: originalCollection.settings.customCTA,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        });
      }

      // Duplicate media
      if (
        originalCollection.collectionMedia &&
        Array.isArray(originalCollection.collectionMedia)
      ) {
        for (const mediaItem of originalCollection.collectionMedia) {
          await trx.insert(collectionMediaTable).values({
            collectionId: newCollection.id,
            mediaId: mediaItem.mediaId,
            type: mediaItem.type,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          });
        }
      }

      log.info("Collection duplicated successfully", { id: newCollection!.id });
      return newCollection;
    });

    if (!duplicatedCollection) {
      throw new Error(
        "Failed to duplicate collection - transaction returned no data",
      );
    }
    // Invalidate all related caches (Next.js and Redis)
    await invalidateCollectionCaches(
      duplicatedCollection.id,
      duplicatedCollection.slug,
    );
    log.info(
      "Invalidated all collection-related caches for duplicated collection",
    );
    // Optionally revalidate Next.js paths/tags (already handled in invalidateCollectionCaches)
    revalidateCollectionCaches(
      duplicatedCollection.id,
      duplicatedCollection.slug,
    );
    log.info(
      "Revalidated all collection-related caches for duplicated collection",
    );

    return {
      success: `Collection \"${originalCollection.title}\" has been duplicated`,
      data: duplicatedCollection,
    };
  } catch (err) {
    log.error("Error in duplicateCollection action", {
      error: err,
      message: err instanceof Error ? err.message : "Unknown error occurred",
      stack: err instanceof Error ? err.stack : undefined,
    });
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    return { error: `Failed to duplicate collection: ${message}` };
  }
}
