import { unstable_cache as cache } from "next/cache";
import { asc, eq, isNull } from "drizzle-orm";

import { db } from "@ziron/db/client";
import { collectionsTable } from "@ziron/db/schema";

import type {
  Collection,
  CollectionQueryResult,
  CollectionsQueryResult,
} from "../types";
import {
  CACHE_DURATIONS,
  CACHE_TAGS,
  REDIS_KEYS,
  redisCache,
} from "../utils/cache";
import { withCacheMonitoring } from "../utils/cache-monitor";

export const existingCollection = cache(
  async (slug: string): Promise<CollectionQueryResult> => {
    return withCacheMonitoring(
      async () => {
        // Try Redis first
        const cached = await redisCache.get<Collection>(
          REDIS_KEYS.COLLECTION_BY_SLUG(slug),
        );
        if (cached) {
          return cached;
        }

        // Fallback to database
        const collection = await db.query.collectionsTable.findFirst({
          where: eq(collectionsTable.slug, slug),
        });

        // Cache the result
        if (collection) {
          await redisCache.set(
            REDIS_KEYS.COLLECTION_BY_SLUG(slug),
            collection,
            CACHE_DURATIONS.MEDIUM,
          );
        }

        return collection;
      },
      REDIS_KEYS.COLLECTION_BY_SLUG(slug),
      false, // This is a miss since we're checking existence
    );
  },
  ["existing-collection"],
  {
    tags: [CACHE_TAGS.COLLECTION_BY_SLUG],
    revalidate: CACHE_DURATIONS.MEDIUM,
  },
);

export const getCollections = cache(
  async (): Promise<CollectionsQueryResult> => {
    return withCacheMonitoring(
      async () => {
        // Try Redis first
        const cached = await redisCache.get<Collection[]>(
          REDIS_KEYS.COLLECTIONS,
        );
        if (cached) {
          return cached;
        }

        // Fallback to database
        const collections = await db.query.collectionsTable.findMany({
          where: isNull(collectionsTable.deletedAt),
          orderBy: asc(collectionsTable.sortOrder),
        });

        // Cache the result
        await redisCache.set(
          REDIS_KEYS.COLLECTIONS,
          collections,
          CACHE_DURATIONS.LONG,
        );

        return collections;
      },
      REDIS_KEYS.COLLECTIONS,
      false, // This is a miss since we're fetching fresh data
    );
  },
  ["get-collections"],
  {
    tags: [CACHE_TAGS.COLLECTIONS],
    revalidate: CACHE_DURATIONS.LONG,
  },
);

export const getCollectionBySlug = cache(
  async (slug: string): Promise<CollectionQueryResult> => {
    return withCacheMonitoring(
      async () => {
        // Try Redis first
        const cached = await redisCache.get<Collection>(
          REDIS_KEYS.COLLECTION_BY_SLUG(slug),
        );
        if (cached) {
          return cached;
        }

        // Fallback to database
        const collection = await db.query.collectionsTable.findFirst({
          where: eq(collectionsTable.slug, slug),
        });

        // Cache the result
        if (collection) {
          await redisCache.set(
            REDIS_KEYS.COLLECTION_BY_SLUG(slug),
            collection,
            CACHE_DURATIONS.MEDIUM,
          );
        }

        return collection;
      },
      REDIS_KEYS.COLLECTION_BY_SLUG(slug),
      false, // This is a miss since we're fetching fresh data
    );
  },
  ["get-collection-by-slug"],
  {
    tags: [CACHE_TAGS.COLLECTION_BY_SLUG],
    revalidate: CACHE_DURATIONS.MEDIUM,
  },
);

export const getCollectionById = cache(
  async (id: string): Promise<CollectionQueryResult> => {
    return withCacheMonitoring(
      async () => {
        // Try Redis first
        const cached = await redisCache.get<Collection>(
          REDIS_KEYS.COLLECTION_BY_ID(id),
        );
        if (cached) {
          return cached;
        }

        // Fallback to database
        const collection = await db.query.collectionsTable.findFirst({
          where: eq(collectionsTable.id, id),
        });

        // Cache the result
        if (collection) {
          await redisCache.set(
            REDIS_KEYS.COLLECTION_BY_ID(id),
            collection,
            CACHE_DURATIONS.MEDIUM,
          );
        }

        return collection;
      },
      REDIS_KEYS.COLLECTION_BY_ID(id),
      false, // This is a miss since we're fetching fresh data
    );
  },
  ["get-collection-by-id"],
  {
    tags: [CACHE_TAGS.COLLECTION_BY_ID],
    revalidate: CACHE_DURATIONS.MEDIUM,
  },
);

export const getActiveCollections = cache(
  async (): Promise<CollectionsQueryResult> => {
    return withCacheMonitoring(
      async () => {
        const collections = await getCollections();
        return collections.filter((collection) => !collection.deletedAt);
      },
      `${REDIS_KEYS.COLLECTIONS}:active`,
      false,
    );
  },
  ["get-active-collections"],
  {
    tags: [CACHE_TAGS.COLLECTION_ACTIVE],
    revalidate: CACHE_DURATIONS.MEDIUM,
  },
);

// Optimistic cache updates
export const updateCollectionCache = async (
  collection: Collection,
  operation: "create" | "update" | "delete" = "update",
) => {
  try {
    if (operation === "delete") {
      // Remove from cache
      await redisCache.del(
        REDIS_KEYS.COLLECTION_BY_SLUG(collection.slug),
        REDIS_KEYS.COLLECTION_BY_ID(collection.id),
      );
    } else {
      // Update cache optimistically
      await Promise.all([
        redisCache.set(
          REDIS_KEYS.COLLECTION_BY_SLUG(collection.slug),
          collection,
          CACHE_DURATIONS.MEDIUM,
        ),
        redisCache.set(
          REDIS_KEYS.COLLECTION_BY_ID(collection.id),
          collection,
          CACHE_DURATIONS.MEDIUM,
        ),
      ]);
    }

    // Always invalidate the collections list cache
    await redisCache.del(REDIS_KEYS.COLLECTIONS);
  } catch (error) {
    console.error("Failed to update collection cache:", error);
    // Don't throw - cache updates should not break the main operation
  }
};

// Cache invalidation functions
export const invalidateCollectionCache = async (slug?: string, id?: string) => {
  const keysToInvalidate: string[] = [REDIS_KEYS.COLLECTIONS];

  if (slug) {
    keysToInvalidate.push(REDIS_KEYS.COLLECTION_BY_SLUG(slug));
  }

  if (id) {
    keysToInvalidate.push(REDIS_KEYS.COLLECTION_BY_ID(id));
  }

  await redisCache.del(...keysToInvalidate);
};

export const invalidateAllCollectionCaches = async () => {
  await redisCache.invalidatePattern("collection:*");
};
