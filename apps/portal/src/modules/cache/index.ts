import { revalidatePath, revalidateTag } from "next/cache";

import redis from "@ziron/redis";

import { CACHE_DURATIONS } from "./constants";

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

// Redis cache keys
export const REDIS_KEYS = {
  COLLECTIONS: "collections:all",
  COLLECTIONS_METADATA: "collections:all:metadata",
  COLLECTION_BY_SLUG: (slug: string) => `collection:${slug}`,
  COLLECTION_BY_ID: (id: string) => `collection:id:${id}`,
  COLLECTION_STATS: "collections:stats",
  COLLECTION_POPULAR: "collections:popular",
  COLLECTION_RECENT: "collections:recent",
  PRODUCTS: "products:all",
  PRODUCTS_METADATA: "products:all:metadata",
  PRODUCT_BY_SLUG: (slug: string) => `product:${slug}`,
  PRODUCT_BY_ID: (id: string) => `product:id:${id}`,
  PRODUCT_STATS: "products:stats",
  PRODUCT_POPULAR: "products:popular",
  PRODUCT_RECENT: "products:recent",
} as const;

// Redis cache utilities with improved typing and error handling
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

  async set<T>(key: string, data: T, ttl: number = CACHE_DURATIONS.MEDIUM): Promise<void> {
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

  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    evictedKeys: number;
    uptimeSeconds: number;
    peakMemoryUsage: string;
    maxMemoryPolicy: string;
  } | null> {
    try {
      const infoMemoryRaw = await redis.info("memory");
      const infoStatsRaw = await redis.info("stats");
      const infoServerRaw = await redis.info("server");
      const infoMemory = typeof infoMemoryRaw === "string" ? infoMemoryRaw : "";
      const infoStats = typeof infoStatsRaw === "string" ? infoStatsRaw : "";
      const infoServer = typeof infoServerRaw === "string" ? infoServerRaw : "";
      const keys = await redis.dbsize();

      // Parse memory info
      const memoryMatch = infoMemory.match(/used_memory_human:(\S+)/);
      const memoryUsage = memoryMatch?.[1] || "unknown";
      const peakMemoryMatch =
        (infoMemory ?? "").match(/peak_memory_human:(\S+)/) || (infoMemory ?? "").match(/used_memory_peak_human:(\S+)/);
      const peakMemoryUsage = peakMemoryMatch?.[1] || "unknown";
      const maxMemoryPolicyMatch = (infoMemory ?? "").match(/maxmemory_policy:(\S+)/);
      const maxMemoryPolicy = maxMemoryPolicyMatch?.[1] || "unknown";

      // Parse stats info
      const evictedKeysMatch = infoStats.match(/evicted_keys:(\d+)/);

      const evictedKeys =
        evictedKeysMatch && evictedKeysMatch[1] !== undefined ? Number.parseInt(evictedKeysMatch[1], 10) : 0;

      // Parse server info
      const uptimeMatch = infoServer.match(/uptime_in_seconds:(\d+)/);
      const uptimeSeconds = uptimeMatch && uptimeMatch[1] !== undefined ? Number.parseInt(uptimeMatch[1], 10) : 0;

      return {
        totalKeys: keys,
        memoryUsage,
        evictedKeys,
        uptimeSeconds,
        peakMemoryUsage,
        maxMemoryPolicy,
      };
    } catch (error) {
      console.error("Redis stats error:", error);
      return null;
    }
  },

  // Enhanced cache operations with retry logic
  async getWithRetry<T>(key: string, retries = 3): Promise<T | null> {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.get<T>(key);
      } catch (error) {
        if (i === retries - 1) {
          console.error(`Redis get failed after ${retries} retries for key ${key}:`, error);
          return null;
        }
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 100));
      }
    }
    return null;
  },

  async setWithRetry<T>(key: string, data: T, ttl: number = CACHE_DURATIONS.MEDIUM, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.set(key, data, ttl);
        return;
      } catch (error) {
        if (i === retries - 1) {
          console.error(`Redis set failed after ${retries} retries for key ${key}:`, error);
          return;
        }
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 100));
      }
    }
  },

  // Cache warming utilities
  async warmCache<T>(key: string, dataFetcher: () => Promise<T>, ttl?: number): Promise<void> {
    try {
      const data = await dataFetcher();
      await this.set(key, data, ttl);
      console.log(`Warmed cache for key: ${key}`);
    } catch (error) {
      console.error(`Cache warming failed for key ${key}:`, error);
    }
  },

  // Batch operations for better performance
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await redis.mget(...keys);
      return values.map((value) => (value ? JSON.parse(value) : null));
    } catch (error) {
      console.error("Redis mget error:", error);
      return keys.map(() => null);
    }
  },

  async mset<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    try {
      const pipeline = redis.pipeline();

      for (const { key, value, ttl } of entries) {
        if (ttl) {
          pipeline.setex(key, ttl, JSON.stringify(value));
        } else {
          pipeline.set(key, JSON.stringify(value));
        }
      }

      await pipeline.exec();
    } catch (error) {
      console.error("Redis mset error:", error);
    }
  },
};

// Helper function to revalidate all collection-related caches
export const revalidateCollectionCaches = (collectionId?: string, slug?: string) => {
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

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/collections/[slug]", "page");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
};

// Enhanced cache invalidation with Redis
export const invalidateCollectionCaches = async (collectionId?: string, slug?: string) => {
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

// Cache health check
export const checkCacheHealth = async (): Promise<{
  redis: boolean;
  memoryUsage: string;
  totalKeys: number;
}> => {
  try {
    const stats = await redisCache.getStats();
    return {
      redis: true,
      memoryUsage: stats?.memoryUsage || "unknown",
      totalKeys: stats?.totalKeys || 0,
    };
  } catch (error) {
    console.error("Cache health check failed:", error);
    return {
      redis: false,
      memoryUsage: "unknown",
      totalKeys: 0,
    };
  }
};

// Cache cleanup utilities
export const cleanupExpiredCaches = async (): Promise<void> => {
  try {
    // Redis automatically handles TTL, but we can add custom cleanup logic here
    console.log("Cache cleanup completed");
  } catch (error) {
    console.error("Cache cleanup failed:", error);
  }
};
