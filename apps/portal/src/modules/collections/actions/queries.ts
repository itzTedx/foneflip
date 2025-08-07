import { unstable_cache as cache } from "next/cache";

import { collectionsTable } from "@ziron/db/schema";
import { asc, db, eq, isNull, sql } from "@ziron/db/server";

import { CACHE_TAGS, REDIS_KEYS, redisCache } from "@/modules/cache";
import { CACHE_DURATIONS } from "@/modules/cache/constants";

import type { Collection, CollectionMetadata, CollectionQueryResult, CollectionsQueryResult } from "../types";
import { withCacheMonitoring } from "../utils/cache-monitor";

export const existingCollection = cache(
  async (slug: string) => {
    return withCacheMonitoring(
      async () => {
        // Try Redis first
        const cached = await redisCache.get<Collection>(REDIS_KEYS.COLLECTION_BY_SLUG(slug));
        if (cached) {
          return cached;
        }

        // Fallback to database
        const collection = await db.query.collectionsTable.findFirst({
          where: eq(collectionsTable.slug, slug),
        });

        // Cache the result
        if (collection) {
          await redisCache.set(REDIS_KEYS.COLLECTION_BY_SLUG(slug), collection, CACHE_DURATIONS.MEDIUM);
        }

        return collection;
      },
      REDIS_KEYS.COLLECTION_BY_SLUG(slug),
      false // This is a miss since we're checking existence
    );
  },
  ["existing-collection"],
  {
    tags: [CACHE_TAGS.COLLECTION_BY_SLUG],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);

export const getCollections = cache(
  async (): Promise<CollectionsQueryResult> => {
    return withCacheMonitoring(
      async () => {
        // Try Redis first
        const cached = await redisCache.get<CollectionsQueryResult>(REDIS_KEYS.COLLECTIONS);
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
        await redisCache.set(REDIS_KEYS.COLLECTIONS, collections, CACHE_DURATIONS.LONG);

        return collections;
      },
      REDIS_KEYS.COLLECTIONS,
      false // This is a miss since we're fetching fresh data
    );
  },
  ["get-collections"],
  {
    tags: [CACHE_TAGS.COLLECTIONS],
    revalidate: CACHE_DURATIONS.LONG,
  }
);

export const getCollectionsCount = cache(
  async (): Promise<number> => {
    return withCacheMonitoring(
      async () => {
        // Try Redis first
        const cached = await redisCache.get<number>(REDIS_KEYS.COLLECTIONS_COUNT);
        if (cached) {
          return cached;
        }

        // Fallback to database
        const result = await db
          .select({ count: sql<number>`count(1)` })
          .from(collectionsTable)
          .where(isNull(collectionsTable.deletedAt));

        const count = result[0]?.count ?? 0;

        // Cache the result
        await redisCache.set(REDIS_KEYS.COLLECTIONS_COUNT, count, CACHE_DURATIONS.LONG);

        return count;
      },
      REDIS_KEYS.COLLECTIONS_COUNT,
      false // This is a miss since we're fetching fresh data
    );
  },
  ["get-collections-count"],
  {
    tags: [CACHE_TAGS.COLLECTIONS],
    revalidate: CACHE_DURATIONS.LONG,
  }
);

export type CollectionsQueryResultType = Awaited<ReturnType<typeof getCollections>>;

export const getCollectionBySlug = cache(
  async (slug: string) => {
    // Try Redis first
    const cached = await redisCache.get<Collection>(REDIS_KEYS.COLLECTION_BY_SLUG(slug));
    if (cached) {
      return cached;
    }

    // Fallback to database
    const collection = await db.query.collectionsTable.findFirst({
      where: eq(collectionsTable.slug, slug),
    });

    // Cache the result
    if (collection) {
      await redisCache.set(REDIS_KEYS.COLLECTION_BY_SLUG(slug), collection, CACHE_DURATIONS.MEDIUM);
    }

    return collection;
  },

  [CACHE_TAGS.COLLECTION_BY_SLUG, "slug"],
  {
    tags: [CACHE_TAGS.COLLECTION_BY_ID, CACHE_TAGS.COLLECTION, CACHE_TAGS.PRODUCT, CACHE_TAGS.MEDIA],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);

export const getCollectionById = cache(
  async (id: string): Promise<CollectionQueryResult | null> => {
    if (id === "new") {
      return null;
    }
    return withCacheMonitoring(
      async () => {
        // Try Redis first
        const cached = await redisCache.get<CollectionQueryResult>(REDIS_KEYS.COLLECTION_BY_ID(id));
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
          await redisCache.set(REDIS_KEYS.COLLECTION_BY_ID(id), collection, CACHE_DURATIONS.MEDIUM);
        }

        return collection;
      },
      REDIS_KEYS.COLLECTION_BY_ID(id),
      false // This is a miss since we're fetching fresh data
    );
  },
  [CACHE_TAGS.COLLECTION_BY_ID, "id"],
  {
    tags: [CACHE_TAGS.COLLECTION_BY_ID, CACHE_TAGS.COLLECTION, CACHE_TAGS.PRODUCT, CACHE_TAGS.MEDIA],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);

export const getActiveCollections = cache(
  async (): Promise<CollectionsQueryResult> => {
    return withCacheMonitoring(
      async () => {
        const collections = await getCollections();

        return collections.filter((collection) => !collection?.deletedAt);
      },
      `${REDIS_KEYS.COLLECTIONS}:active`,
      false
    );
  },
  ["get-active-collections"],
  {
    tags: [CACHE_TAGS.COLLECTION_ACTIVE],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);

export const getCollectionsMetadata = cache(
  async (): Promise<CollectionMetadata[]> => {
    // Try Redis first
    const cached = await redisCache.get<CollectionMetadata[]>(REDIS_KEYS.COLLECTIONS_METADATA);
    if (cached) {
      return cached;
    }

    // Fallback to database
    const collections = await db.query.collectionsTable.findMany({
      where: isNull(collectionsTable.deletedAt),
      columns: {
        id: true,
        title: true,
        createdAt: true,
        slug: true,
      },
      orderBy: asc(collectionsTable.sortOrder),
    });

    // Cache the result
    if (collections) {
      await redisCache.set(REDIS_KEYS.COLLECTIONS_METADATA, collections, CACHE_DURATIONS.MEDIUM);
    }

    return collections;
  },

  ["get-collections"],
  {
    tags: [CACHE_TAGS.COLLECTIONS],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);
export type CollectionsMetadataQueryResultType = Awaited<ReturnType<typeof getCollectionsMetadata>>;
