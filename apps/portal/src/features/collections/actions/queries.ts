import { unstable_cache as cache } from "next/cache";

import { asc, db, eq, isNull } from "@ziron/db";
import { collectionsTable } from "@ziron/db/schema";

import type { Collection, CollectionsQueryResult } from "../types";
import {
  CACHE_DURATIONS,
  CACHE_TAGS,
  REDIS_KEYS,
  redisCache,
} from "../utils/cache";
import { withCacheMonitoring } from "../utils/cache-monitor";

export const existingCollection = cache(
  async (slug: string) => {
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
          with: {
            seo: true,
            settings: true,
            collectionMedia: {
              with: { media: true },
            },
          },
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
  async (slug: string) => {
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

  [CACHE_TAGS.COLLECTION_BY_SLUG, "slug"],
  {
    tags: [
      CACHE_TAGS.COLLECTION_BY_ID,
      CACHE_TAGS.COLLECTION,
      CACHE_TAGS.PRODUCT,
      CACHE_TAGS.MEDIA,
    ],
    revalidate: CACHE_DURATIONS.MEDIUM,
  },
);

export const getCollectionById = cache(
  async (id: string) => {
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
          with: {
            seo: true,
            settings: true,
            collectionMedia: { with: { media: true } },
          },
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
  [CACHE_TAGS.COLLECTION_BY_ID, "id"],
  {
    tags: [
      CACHE_TAGS.COLLECTION_BY_ID,
      CACHE_TAGS.COLLECTION,
      CACHE_TAGS.PRODUCT,
      CACHE_TAGS.MEDIA,
    ],
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
