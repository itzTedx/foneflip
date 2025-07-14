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

export const existingCollection = cache(
  async (slug: string): Promise<CollectionQueryResult> => {
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
  ["existing-collection"],
  {
    tags: [CACHE_TAGS.COLLECTION_BY_SLUG],
    revalidate: CACHE_DURATIONS.MEDIUM,
  },
);

export const getCollections = cache(
  async (): Promise<CollectionsQueryResult> => {
    // Try Redis first
    const cached = await redisCache.get<Collection[]>(REDIS_KEYS.COLLECTIONS);
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
  ["get-collections"],
  {
    tags: [CACHE_TAGS.COLLECTIONS],
    revalidate: CACHE_DURATIONS.LONG,
  },
);

export const getCollectionBySlug = cache(
  async (slug: string): Promise<CollectionQueryResult> => {
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
  ["get-collection-by-slug"],
  {
    tags: [CACHE_TAGS.COLLECTION_BY_SLUG],
    revalidate: CACHE_DURATIONS.MEDIUM,
  },
);

export const getCollectionById = cache(
  async (id: string): Promise<CollectionQueryResult> => {
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
  ["get-collection-by-id"],
  {
    tags: [CACHE_TAGS.COLLECTION_BY_ID],
    revalidate: CACHE_DURATIONS.MEDIUM,
  },
);

export const getActiveCollections = cache(
  async (): Promise<CollectionsQueryResult> => {
    const collections = await getCollections();
    return collections.filter((collection) => !collection.deletedAt);
  },
  ["get-active-collections"],
  {
    tags: [CACHE_TAGS.COLLECTION_ACTIVE],
    revalidate: CACHE_DURATIONS.MEDIUM,
  },
);

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
