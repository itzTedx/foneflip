import { revalidatePath, revalidateTag } from "next/cache";

import redis from "@ziron/redis";

// Cache configuration constants
export const CACHE_TAGS = {
  COLLECTION: "collection",
  COLLECTIONS: "collections",
  COLLECTION_DRAFTS: "collection-drafts",
  COLLECTION_ACTIVE: "collection-active",
  COLLECTION_ARCHIVED: "collection-archived",
  COLLECTION_BY_SLUG: "collection-by-slug",
  COLLECTION_BY_ID: "collection-by-id",
  COLLECTION_DETAILS: "collection-details",
  PRODUCT: "product",
  MEDIA: "media",
} as const;

export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Redis cache keys
export const REDIS_KEYS = {
  COLLECTIONS: "collections:all",
  COLLECTION_BY_SLUG: (slug: string) => `collection:${slug}`,
  COLLECTION_BY_ID: (id: string) => `collection:id:${id}`,
  COLLECTION_STATS: "collections:stats",
} as const;

// Redis cache utilities with improved typing
export const redisCache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error(`Redis get error for key ${key}:`, error);
      return null;
    }
  },

  async set<T>(
    key: string,
    data: T,
    ttl: number = CACHE_DURATIONS.MEDIUM,
  ): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error(`Redis set error for key ${key}:`, error);
    }
  },

  async del(...keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Redis deletion error:", error);
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`Redis pattern invalidation error for ${pattern}:`, error);
    }
  },

  async getStats(): Promise<{ totalKeys: number; memoryUsage: string } | null> {
    try {
      const info = await redis.info("memory");
      const keys = await redis.dbsize();

      // Parse memory info to get used memory
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const memoryUsage = memoryMatch?.[1] || "unknown";

      return {
        totalKeys: keys,
        memoryUsage,
      };
    } catch (error) {
      console.error("Redis stats error:", error);
      return null;
    }
  },
};

// Helper function to revalidate all collection-related caches
export const revalidateCollectionCaches = (
  collectionId?: string,
  slug?: string,
) => {
  revalidateTag(CACHE_TAGS.COLLECTION);
  revalidateTag(CACHE_TAGS.COLLECTIONS);
  revalidateTag(CACHE_TAGS.COLLECTION_DRAFTS);
  revalidateTag(CACHE_TAGS.COLLECTION_ACTIVE);
  revalidateTag(CACHE_TAGS.COLLECTION_ARCHIVED);
  revalidateTag(CACHE_TAGS.COLLECTION_DETAILS);
  revalidateTag(CACHE_TAGS.PRODUCT);
  revalidateTag(CACHE_TAGS.MEDIA);

  if (collectionId) {
    revalidateTag(`${CACHE_TAGS.COLLECTION_BY_ID}:${collectionId}`);
  }
  if (slug) {
    revalidateTag(`${CACHE_TAGS.COLLECTION_BY_SLUG}:${slug}`);
  }

  revalidatePath("/collections");
  revalidatePath("/collections/[slug]", "page");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
};

// Enhanced cache invalidation with Redis
export const invalidateCollectionCaches = async (
  collectionId?: string,
  slug?: string,
) => {
  // Invalidate Next.js caches
  revalidateCollectionCaches(collectionId, slug);

  // Invalidate Redis caches
  const keysToInvalidate: string[] = [REDIS_KEYS.COLLECTIONS];

  if (slug) {
    keysToInvalidate.push(REDIS_KEYS.COLLECTION_BY_SLUG(slug));
  }

  if (collectionId) {
    keysToInvalidate.push(REDIS_KEYS.COLLECTION_BY_ID(collectionId));
  }

  await redisCache.del(...keysToInvalidate);
};

// Bulk cache invalidation
export const invalidateAllCollectionCaches = async () => {
  // Invalidate all Next.js collection tags
  Object.values(CACHE_TAGS).forEach((tag) => {
    revalidateTag(tag);
  });

  // Invalidate all Redis collection keys
  await redisCache.invalidatePattern("collection:*");
  await redisCache.invalidatePattern("collections:*");
};

// Cache warming utilities
export const warmCollectionCache = async (slug: string) => {
  try {
    // This would typically fetch the collection and cache it
    // Implementation depends on your specific needs
    console.log(`Warming cache for collection: ${slug}`);
  } catch (error) {
    console.error(`Cache warming failed for ${slug}:`, error);
  }
};

export const warmAllCollectionCaches = async () => {
  try {
    // Fetch all collections and cache them
    // This is useful for pre-loading frequently accessed data
    console.log("Warming all collection caches");
  } catch (error) {
    console.error("Cache warming failed:", error);
  }
};
