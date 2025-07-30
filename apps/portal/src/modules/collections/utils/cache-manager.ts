import { CACHE_DURATIONS, REDIS_KEYS, redisCache } from "../../cache";
import type { Collection } from "../types";
import { CacheMonitor, getCacheInsights } from "./cache-monitor";

export class CollectionCacheManager {
  private static instance: CollectionCacheManager;
  private monitor: CacheMonitor;

  private constructor() {
    this.monitor = CacheMonitor.getInstance();
  }

  static getInstance(): CollectionCacheManager {
    if (!CollectionCacheManager.instance) {
      CollectionCacheManager.instance = new CollectionCacheManager();
    }
    return CollectionCacheManager.instance;
  }

  // Get collection by slug with comprehensive caching
  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    const startTime = Date.now();

    try {
      // Try cache first
      const cached = await redisCache.getWithRetry<Collection>(REDIS_KEYS.COLLECTION_BY_SLUG(slug));

      if (cached) {
        const responseTime = Date.now() - startTime;
        this.monitor.recordHit(responseTime);
        return cached;
      }

      // Cache miss - fetch from database
      const { getCollectionBySlug } = await import("../actions/queries");
      const collection = await getCollectionBySlug(slug);

      const responseTime = Date.now() - startTime;
      this.monitor.recordMiss(responseTime);

      // Cache the result
      if (collection) {
        await redisCache.setWithRetry(REDIS_KEYS.COLLECTION_BY_SLUG(slug), collection, CACHE_DURATIONS.MEDIUM);
      }

      return collection || null;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.monitor.recordMiss(responseTime);
      console.error(`Failed to get collection by slug ${slug}:`, error);
      return null;
    }
  }

  // Get collection by ID with comprehensive caching
  async getCollectionById(id: string): Promise<Collection | null> {
    const startTime = Date.now();

    try {
      // Try cache first
      const cached = await redisCache.getWithRetry<Collection>(REDIS_KEYS.COLLECTION_BY_ID(id));

      if (cached) {
        const responseTime = Date.now() - startTime;
        this.monitor.recordHit(responseTime);
        return cached;
      }

      // Cache miss - fetch from database
      const { getCollectionById } = await import("../actions/queries");
      const collection = await getCollectionById(id);

      const responseTime = Date.now() - startTime;
      this.monitor.recordMiss(responseTime);

      // Cache the result
      if (collection) {
        await redisCache.setWithRetry(REDIS_KEYS.COLLECTION_BY_ID(id), collection, CACHE_DURATIONS.MEDIUM);
      }

      return collection || null;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.monitor.recordMiss(responseTime);
      console.error(`Failed to get collection by ID ${id}:`, error);
      return null;
    }
  }

  // Get all collections with comprehensive caching
  async getAllCollections(): Promise<Collection[]> {
    const startTime = Date.now();

    try {
      // Try cache first
      const cached = await redisCache.getWithRetry<Collection[]>(REDIS_KEYS.COLLECTIONS);

      if (cached) {
        const responseTime = Date.now() - startTime;
        this.monitor.recordHit(responseTime);
        return cached;
      }

      // Cache miss - fetch from database
      const { getCollections } = await import("../actions/queries");
      const collections = await getCollections();

      const responseTime = Date.now() - startTime;
      this.monitor.recordMiss(responseTime);

      // Cache the result
      await redisCache.setWithRetry(REDIS_KEYS.COLLECTIONS, collections, CACHE_DURATIONS.LONG);

      return collections;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.monitor.recordMiss(responseTime);
      console.error("Failed to get all collections:", error);
      return [];
    }
  }

  // Update collection cache optimistically
  async updateCollectionCache(
    collection: Collection,
    operation: "create" | "update" | "delete" = "update"
  ): Promise<void> {
    try {
      if (operation === "delete") {
        // Remove from cache
        await Promise.all([
          redisCache.del(REDIS_KEYS.COLLECTION_BY_SLUG(collection.slug)),
          redisCache.del(REDIS_KEYS.COLLECTION_BY_ID(collection.id)),
          redisCache.del(REDIS_KEYS.COLLECTIONS), // Invalidate list cache
        ]);
      } else {
        // Update cache optimistically
        await Promise.all([
          redisCache.setWithRetry(REDIS_KEYS.COLLECTION_BY_SLUG(collection.slug), collection, CACHE_DURATIONS.MEDIUM),
          redisCache.setWithRetry(REDIS_KEYS.COLLECTION_BY_ID(collection.id), collection, CACHE_DURATIONS.MEDIUM),
          redisCache.del(REDIS_KEYS.COLLECTIONS), // Invalidate list cache
        ]);
      }
    } catch (error) {
      console.error("Failed to update collection cache:", error);
      // Don't throw - cache updates should not break the main operation
    }
  }

  // Batch cache operations for better performance
  async getCollectionsBatch(slugs: string[]): Promise<Map<string, Collection | null>> {
    const result = new Map<string, Collection | null>();
    const missingSlugs: string[] = [];

    try {
      // Try to get all from cache first
      const cacheKeys = slugs.map((slug) => REDIS_KEYS.COLLECTION_BY_SLUG(slug));
      const cachedResults = await redisCache.mget<Collection>(cacheKeys);

      // Process cached results
      cachedResults.forEach((cached, index) => {
        const slug = slugs[index];
        if (cached) {
          result.set(slug, cached);
          this.monitor.recordHit(0); // Minimal response time for cache hits
        } else {
          missingSlugs.push(slug);
        }
      });

      // Fetch missing collections from database
      if (missingSlugs.length > 0) {
        const { getCollectionBySlug } = await import("../actions/queries");

        const fetchPromises = missingSlugs.map(async (slug) => {
          const collection = await getCollectionBySlug(slug);
          if (collection) {
            // Cache the result
            await redisCache.setWithRetry(REDIS_KEYS.COLLECTION_BY_SLUG(slug), collection, CACHE_DURATIONS.MEDIUM);
          }
          return { slug, collection: collection || null };
        });

        const fetchedResults = await Promise.all(fetchPromises);
        fetchedResults.forEach(({ slug, collection }) => {
          result.set(slug, collection);
          this.monitor.recordMiss(0); // Minimal response time for cache misses
        });
      }
    } catch (error) {
      console.error("Failed to get collections batch:", error);
      // Return empty results on error
      slugs.forEach((slug) => result.set(slug, null));
    }

    return result;
  }

  // Cache warming for frequently accessed collections
  async warmPopularCollections(popularSlugs: string[]): Promise<void> {
    try {
      const { getCollectionBySlug } = await import("../actions/queries");

      const warmPromises = popularSlugs.map(async (slug) => {
        try {
          const collection = await getCollectionBySlug(slug);
          if (collection) {
            await redisCache.setWithRetry(
              REDIS_KEYS.COLLECTION_BY_SLUG(slug),
              collection,
              CACHE_DURATIONS.LONG // Longer TTL for popular collections
            );
            console.log(`Warmed cache for popular collection: ${slug}`);
          }
        } catch (error) {
          console.error(`Failed to warm cache for ${slug}:`, error);
        }
      });

      await Promise.all(warmPromises);
    } catch (error) {
      console.error("Failed to warm popular collections:", error);
    }
  }

  // Get cache performance insights
  async getPerformanceInsights() {
    return await getCacheInsights();
  }

  // Health check for cache system
  async healthCheck(): Promise<{
    cache: boolean;
    performance: any;
    memoryUsage: string;
    totalKeys: number;
  }> {
    try {
      const stats = await redisCache.getStats();
      const insights = await this.getPerformanceInsights();

      return {
        cache: stats !== null,
        performance: insights,
        memoryUsage: stats?.memoryUsage || "unknown",
        totalKeys: stats?.totalKeys || 0,
      };
    } catch (error) {
      console.error("Cache health check failed:", error);
      return {
        cache: false,
        performance: null,
        memoryUsage: "unknown",
        totalKeys: 0,
      };
    }
  }

  // Clear all collection caches
  async clearAllCaches(): Promise<void> {
    try {
      await redisCache.invalidatePattern("collection:*");
      await redisCache.invalidatePattern("collections:*");
      console.log("All collection caches cleared");
    } catch (error) {
      console.error("Failed to clear caches:", error);
    }
  }
}

// Export singleton instance
export const collectionCacheManager = CollectionCacheManager.getInstance();
