"use server";

import { requireUser } from "@/features/auth/actions/data-access";
import { convertToCsv, createLog } from "@/lib/utils";

import { asc, db, desc, eq, isNull } from "@ziron/db";
import {
  collectionMediaTable,
  collectionSettingsTable,
  collectionsTable,
  collectionStatusEnum,
  seoTable,
} from "@ziron/db/schema";
import { slugify } from "@ziron/utils";
import { collectionSchema, z } from "@ziron/validators";

import { invalidateCollectionCaches } from "../utils/cache";
import {
  invalidateAndRevalidateCaches,
  performOptimisticCacheUpdate,
  revertOptimisticCache,
  updateCacheWithResult,
} from "../utils/cache-helpers";
import { updateCollectionCache } from "./cache";
import {
  createCollectionSlug,
  prepareCollectionData,
  prepareDuplicateCollectionData,
  prepareDuplicateSettingsData,
  upsertCollectionSettings,
  upsertSeoMeta,
} from "./helpers";

const log = createLog("Collection");

export async function upsertCollection(formData: unknown) {
  const session = await requireUser();

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
      const uniqueSlug = await createCollectionSlug({
        title: data.title,
        customSlug: data.slug,
      });

      let sortOrderToUse: number | undefined = undefined;
      if (!data.id) {
        // Only for new collections
        const maxSortOrderResult = await db.query.collectionsTable.findFirst({
          where: isNull(collectionsTable.deletedAt),
          orderBy: [desc(collectionsTable.sortOrder)],
          columns: { sortOrder: true },
        });
        sortOrderToUse = (maxSortOrderResult?.sortOrder ?? 0) + 1;
        if (sortOrderToUse !== undefined) {
          data.sortOrder = sortOrderToUse;
        }
      }

      // --- Upsert SEO meta ---
      let seoId: string | undefined = undefined;
      if (data.meta) {
        const seoResult = await upsertSeoMeta({
          collectionId: data.id,
          meta: data.meta,
          transaction: tx,
        });
        seoId = seoResult.seoId;
      }

      // --- Prepare collection data ---
      const collectionData = prepareCollectionData({
        id: data.id,
        title: data.title,
        description: data.description,
        label: data.label,
        slug: uniqueSlug,
        sortOrder: data.sortOrder,
        seoId,
      });

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
          await performOptimisticCacheUpdate({
            collection: optimisticData as any,
            operation: "update",
          });
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
        await upsertCollectionSettings(
          {
            collectionId: collection.id,
            ...data.settings,
          },
          tx,
        );
      }

      // --- Upsert media (thumbnail, banner) ---
      // Remove existing media for this collection (for simplicity)
      await tx
        .delete(collectionMediaTable)
        .where(eq(collectionMediaTable.collectionId, collection.id));
      const { thumbnail, banner } = data;
      const mediaToInsert = [];
      if (
        thumbnail &&
        thumbnail.file &&
        typeof thumbnail.file.url === "string"
      ) {
        const mediaId = await (
          await import("@/features/media/actions/mutations")
        ).upsertMedia(
          {
            url: thumbnail.file.url,
            fileName: thumbnail.file.name ?? undefined,
            fileSize: thumbnail.file.size ?? undefined,
            width: thumbnail.metadata?.width ?? undefined,
            height: thumbnail.metadata?.height ?? undefined,
            blurData: thumbnail.metadata?.blurData ?? undefined,
            alt: thumbnail.alt,
            key: thumbnail.file.key ?? undefined,
            userId: session.user.id,
          },
          tx,
        );
        const [mediaRow] = await tx
          .insert(collectionMediaTable)
          .values({
            collectionId: collection.id,
            mediaId,
            type: "thumbnail",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          })
          .returning();
        if (mediaRow) mediaToInsert.push(mediaRow);
      }
      if (banner && banner.file && typeof banner.file.url === "string") {
        const mediaId = await (
          await import("@/features/media/actions/mutations")
        ).upsertMedia(
          {
            url: banner.file.url,
            fileName: banner.file.name ?? undefined,
            fileSize: banner.file.size ?? undefined,
            width: banner.metadata?.width ?? undefined,
            height: banner.metadata?.height ?? undefined,
            blurData: banner.metadata?.blurData ?? undefined,
            key: banner.file.key ?? undefined,
            alt: banner.alt,
            userId: session.user.id,
          },
          tx,
        );
        const [mediaRow] = await tx
          .insert(collectionMediaTable)
          .values({
            collectionId: collection.id,
            mediaId,
            type: "banner",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          })
          .returning();
        if (mediaRow) mediaToInsert.push(mediaRow);
      }

      // Update cache with the actual result
      try {
        await updateCacheWithResult(collection, data.id ? "update" : "create");
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
      await invalidateAndRevalidateCaches({
        id: collection.id,
        slug: collection.slug,
      });

      log.info("upsertCollection succeeded", { collection });
      return {
        success: true,
        message: `${collection.title} has been ${data.id ? "updated" : "created"}`,
      };
    });
  } catch (error) {
    log.error("upsertCollection failed", { error });

    // Revert optimistic cache updates on error
    if (data.id) {
      try {
        const baseSlug = data.slug ?? slugify(data.title);
        await revertOptimisticCache({
          id: data.id,
          slug: baseSlug,
        });
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
      const uniqueSlug = await createCollectionSlug({
        title: originalCollection.title,
        customSlug: `${originalCollection.slug}-copy`,
      });

      // Create new collection with duplicated data
      const collectionData = prepareDuplicateCollectionData(
        originalCollection,
        uniqueSlug,
        newSeoId,
      );

      const [newCollection] = await trx
        .insert(collectionsTable)
        .values({
          ...collectionData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!newCollection) {
        throw new Error("Failed to duplicate collection - no data returned");
      }

      // Duplicate settings
      if (originalCollection.settings) {
        const settingsData = prepareDuplicateSettingsData(
          originalCollection.settings,
          newCollection.id,
        );
        await upsertCollectionSettings(settingsData, trx);
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
    await invalidateAndRevalidateCaches({
      id: duplicatedCollection.id,
      slug: duplicatedCollection.slug,
    });

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

/**
 * Save a collection as draft. This always sets settings.status to 'draft'.
 * @param formData - The collection data (partial or full)
 * @param user - The user object (must contain userId)
 */
export async function saveCollectionDraft(formData: unknown) {
  const session = await requireUser();
  // Parse and validate using the same schema as upsertCollection
  const { success, data, error } = collectionSchema.safeParse(formData);
  if (!success) {
    log.warn("Validation failed for saveCollectionDraft", { error });
    return {
      success: false,
      error: "Invalid data",
      message: z.prettifyError(error),
    };
  }

  const {
    id,
    title,
    description,
    label,
    slug,
    sortOrder,
    meta,
    settings = {},
    thumbnail,
    banner,
    ...restOfData
  } = data;

  try {
    log.info("Draft collection action started", { id, title });

    // --- Determine sortOrder for new draft collections ---
    let sortOrderToUse: number | undefined = undefined;
    if (!id) {
      const maxSortOrderResult = await db.query.collectionsTable.findFirst({
        where: isNull(collectionsTable.deletedAt),
        orderBy: desc(collectionsTable.sortOrder),
        columns: { sortOrder: true },
      });
      sortOrderToUse = (maxSortOrderResult?.sortOrder ?? 0) + 1;
    }

    const collection = await db.transaction(async (trx) => {
      // --- Upsert SEO meta ---
      let seo;
      const safeMeta = meta || { title: "", description: "", keywords: "" };
      if (id) {
        const existingCollection = await trx.query.collectionsTable.findFirst({
          where: eq(collectionsTable.id, id),
        });
        seo = await upsertSeoMeta({
          collectionId: id,
          meta: safeMeta,
          transaction: trx,
        });
      } else {
        seo = await upsertSeoMeta({
          meta: safeMeta,
          transaction: trx,
        });
      }

      // --- Upsert collection ---
      const [savedCollection] = await trx
        .insert(collectionsTable)
        .values({
          id,
          title: title || "Untitled Collection",
          description,
          label,
          slug: slug || (title ? slugify(title) : `draft-${Date.now()}`),
          sortOrder: sortOrderToUse !== undefined ? sortOrderToUse : sortOrder,
          seoId: seo.seoId,
          ...restOfData,
          updatedAt: new Date(),
          createdAt: id ? undefined : new Date(),
        })
        .onConflictDoUpdate({
          target: collectionsTable.id,
          set: {
            title: title || "Untitled Collection",
            description,
            label,
            slug: slug || (title ? slugify(title) : `draft-${Date.now()}`),
            sortOrder:
              sortOrderToUse !== undefined ? sortOrderToUse : sortOrder,
            seoId: seo.seoId,
            updatedAt: new Date(),
          },
        })
        .returning();
      if (!savedCollection)
        throw new Error("Failed to save collection draft data");

      // --- Upsert collection settings ---
      await upsertCollectionSettings(
        {
          collectionId: savedCollection.id,
          ...settings,
          status: "draft",
        },
        trx,
      );

      // --- Upsert media (thumbnail, banner) ---
      // Remove existing media for this collection (for simplicity)
      await trx
        .delete(collectionMediaTable)
        .where(eq(collectionMediaTable.collectionId, savedCollection.id));
      const mediaToInsert = [];
      if (
        thumbnail &&
        thumbnail.file &&
        typeof thumbnail.file.url === "string"
      ) {
        const mediaId = await (
          await import("@/features/media/actions/mutations")
        ).upsertMedia(
          {
            url: thumbnail.file.url,
            fileName: thumbnail.file.name ?? undefined,
            fileSize: thumbnail.file.size ?? undefined,
            width: thumbnail.metadata?.width ?? undefined,
            height: thumbnail.metadata?.height ?? undefined,
            blurData: thumbnail.metadata?.blurData ?? undefined,
            key: thumbnail.file.key ?? undefined,
            alt: thumbnail.alt,
            userId: session.user.id,
          },
          trx,
        );
        const [mediaRow] = await trx
          .insert(collectionMediaTable)
          .values({
            collectionId: savedCollection.id,
            mediaId,
            type: "thumbnail",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          })
          .returning();
        if (mediaRow) mediaToInsert.push(mediaRow);
      }
      if (banner && banner.file && typeof banner.file.url === "string") {
        const mediaId = await (
          await import("@/features/media/actions/mutations")
        ).upsertMedia(
          {
            url: banner.file.url,
            fileName: banner.file.name ?? undefined,
            fileSize: banner.file.size ?? undefined,
            width: banner.metadata?.width ?? undefined,
            height: banner.metadata?.height ?? undefined,
            blurData: banner.metadata?.blurData ?? undefined,
            key: banner.file.key ?? undefined,
            alt: banner.alt,
            userId: session.user.id,
          },
          trx,
        );
        const [mediaRow] = await trx
          .insert(collectionMediaTable)
          .values({
            collectionId: savedCollection.id,
            mediaId,
            type: "banner",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          })
          .returning();
        if (mediaRow) mediaToInsert.push(mediaRow);
      }

      log.success(
        "Transaction completed for draft collection",
        savedCollection.id,
      );
      return savedCollection;
    });

    await invalidateCollectionCaches(collection.id, collection.slug);
    log.success("Revalidated all collection-related caches for draft");
    return {
      success: true,
      message: `Collection draft: (${collection.title}) has been ${id ? "updated" : "created"}`,
      data: collection,
    };
  } catch (err) {
    log.error("Collection draft action error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

export async function exportCollectionsToCsv(
  includeProducts: boolean = false,
  includeSeo: boolean = false,
) {
  try {
    log.info("Starting CSV export with options:", {
      includeProducts,
      includeSeo,
    });
    const collections = await db.query.collectionsTable.findMany({
      where: isNull(collectionsTable.deletedAt),
      with: {
        ...(includeProducts && {
          products: {
            with: {
              images: {
                with: {
                  media: true,
                },
              },
              seo: true,
              specifications: true,
              delivery: true,
            },
          },
        }),
        collectionMedia: {
          with: {
            media: true,
          },
        },
        ...(includeSeo && {
          seo: true,
        }),
      },
      orderBy: asc(collectionsTable.createdAt),
    });
    if (!collections || collections.length === 0) {
      log.warn("No collections found for export");
      return { error: "No collections found to export" };
    }
    const csvData = collections.map((collection) => {
      const thumbnailMedia = collection.collectionMedia.find(
        (m) => m.type === "thumbnail",
      );
      const bannerMedia = collection.collectionMedia.find(
        (m) => m.type === "banner",
      );
      const baseData = {
        id: collection.id,
        title: collection.title,
        description: collection.description || "",
        label: collection.label || "",
        slug: collection.slug,

        sortOrder: collection.sortOrder,

        createdAt: collection.createdAt?.toISOString(),
        updatedAt: collection.updatedAt?.toISOString(),
        thumbnailUrl: thumbnailMedia?.media?.url || "",
        thumbnailAlt: thumbnailMedia?.media?.alt || "",
        bannerUrl: bannerMedia?.media?.url || "",
        bannerAlt: bannerMedia?.media?.alt || "",
      };
      if (includeSeo && collection.seo) {
        Object.assign(baseData, {
          metaTitle: collection.seo.metaTitle || "",
          metaDescription: collection.seo.metaDescription || "",
          keywords: collection.seo.keywords || "",
        });
      }
      if (includeProducts) {
        Object.assign(baseData, {
          productCount: collection.products?.length || 0,
          products: collection.products?.map((p) => p.title).join("; ") || "",
        });
      }
      return baseData;
    });
    const csv = convertToCsv(csvData);
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `collections-export-${timestamp}.csv`;
    log.success(
      `CSV export completed successfully. Exported ${collections.length} collections`,
    );
    return {
      success: true,
      data: csv,
      filename,
      recordCount: collections.length,
    };
  } catch (err) {
    log.error("Error in CSV export:", {
      error: err,
      message: err instanceof Error ? err.message : "Unknown error occurred",
      stack: err instanceof Error ? err.stack : undefined,
    });
    return {
      error:
        err instanceof Error ? err.message : "Failed to export collections",
    };
  }
}
