import { unstable_cache as cache } from "next/cache";

import { db } from "@ziron/db/server";

// Cache constants (we'll define these locally until the shared package is ready)
const CACHE_DURATIONS = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  VERY_LONG: 86400,
} as const;

const CACHE_TAGS = {
  STORE_CATEGORIES: "store-categories",
  STORE_COLLECTIONS: "store-collections",
  COLLECTION_BY_SLUG: "collection-by-slug",
} as const;

const REDIS_KEYS = {
  STORE_CATEGORIES_WITH_PRODUCTS: "store:categories:with-products",
  STORE_COLLECTION_BY_SLUG: (slug: string) => `store:collection:${slug}`,
} as const;

// Simple cache monitoring
const withCacheMonitoring = async <T>(dataFetcher: () => Promise<T>, cacheKey: string, isHit: boolean): Promise<T> => {
  const startTime = Date.now();
  try {
    const result = await dataFetcher();
    const responseTime = Date.now() - startTime;
    console.log(`Cache ${isHit ? "hit" : "miss"} for ${cacheKey} (${responseTime}ms)`);
    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`Cache miss with error for ${cacheKey} (${responseTime}ms):`, error);
    throw error;
  }
};

// Store-specific cache utilities
export const storeCache = {
  // Get categories with products (for shop page)
  getCategoriesWithProducts: cache(
    async () => {
      return withCacheMonitoring(
        async () => {
          // Fetch from database with the same query as the original shop page
          const categories = await db.query.collectionsTable.findMany({
            with: {
              collectionMedia: {
                with: {
                  media: true,
                },
              },
              products: {
                with: {
                  images: {
                    with: {
                      media: true,
                    },
                  },
                },
              },
              settings: true,
            },
            orderBy: (collections, { asc }) => [asc(collections.sortOrder)],
          });

          return categories;
        },
        REDIS_KEYS.STORE_CATEGORIES_WITH_PRODUCTS,
        false
      );
    },
    ["store-categories-with-products"],
    {
      tags: [CACHE_TAGS.STORE_CATEGORIES, CACHE_TAGS.STORE_COLLECTIONS],
      revalidate: CACHE_DURATIONS.LONG,
    }
  ),

  // Get individual collection for store
  getCollectionBySlug: cache(
    async (slug: string) => {
      return withCacheMonitoring(
        async () => {
          // Fetch from database
          const collection = await db.query.collectionsTable.findFirst({
            where: (collections, { eq }) => eq(collections.slug, slug),
            with: {
              collectionMedia: {
                with: {
                  media: true,
                },
              },
              products: {
                with: {
                  images: {
                    with: {
                      media: true,
                    },
                  },
                },
              },
              settings: true,
            },
          });

          return collection;
        },
        REDIS_KEYS.STORE_COLLECTION_BY_SLUG(slug),
        false
      );
    },
    ["store-collection-by-slug"],
    {
      tags: [CACHE_TAGS.STORE_COLLECTIONS],
      revalidate: CACHE_DURATIONS.MEDIUM,
    }
  ),
};
