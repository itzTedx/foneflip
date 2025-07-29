import type { CacheInsights, CacheMetrics } from "../types";
import { redisCache } from "./cache";

export class CacheMonitor {
  private static instance: CacheMonitor;
  private metrics = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    responseTimes: [] as number[],
  };

  private constructor() {}

  static getInstance(): CacheMonitor {
    if (!CacheMonitor.instance) {
      CacheMonitor.instance = new CacheMonitor();
    }
    return CacheMonitor.instance;
  }

  recordHit(responseTime: number) {
    this.metrics.hits++;
    this.metrics.totalRequests++;
    this.metrics.responseTimes.push(responseTime);
  }

  recordMiss(responseTime: number) {
    this.metrics.misses++;
    this.metrics.totalRequests++;
    this.metrics.responseTimes.push(responseTime);
  }

  async getMetrics(): Promise<CacheMetrics> {
    const stats = await redisCache.getStats();

    const hitRate =
      this.metrics.totalRequests > 0
        ? (this.metrics.hits / this.metrics.totalRequests) * 100
        : 0;

    const missRate =
      this.metrics.totalRequests > 0
        ? (this.metrics.misses / this.metrics.totalRequests) * 100
        : 0;

    const averageResponseTime =
      this.metrics.responseTimes.length > 0
        ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) /
          this.metrics.responseTimes.length
        : 0;

    return {
      hitRate: Math.round(hitRate * 100) / 100,
      missRate: Math.round(missRate * 100) / 100,
      totalRequests: this.metrics.totalRequests,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      cacheSize: stats?.totalKeys || 0,
      memoryUsage: stats?.memoryUsage || "unknown",
    };
  }

  resetMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      responseTimes: [],
    };
  }

  logMetrics() {
    this.getMetrics().then((metrics) => {
      console.log("=== Cache Metrics ===");
      console.log(`Hit Rate: ${metrics.hitRate}%`);
      console.log(`Miss Rate: ${metrics.missRate}%`);
      console.log(`Total Requests: ${metrics.totalRequests}`);
      console.log(`Average Response Time: ${metrics.averageResponseTime}ms`);
      console.log(`Cache Size: ${metrics.cacheSize} keys`);
      console.log(`Memory Usage: ${metrics.memoryUsage}`);
      console.log("====================");
    });
  }
}

/**
 * Executes an asynchronous operation while recording cache hit or miss metrics.
 *
 * Measures the operation's execution time and updates cache monitoring statistics based on whether the cache was hit. Records a miss and rethrows the error if the operation fails.
 *
 * @param operation - The asynchronous function to execute
 * @param cacheKey - The cache key associated with the operation
 * @param isCacheHit - Indicates if the cache was hit for this operation
 * @returns The result of the asynchronous operation
 */
export async function withCacheMonitoring<T>(
  operation: () => Promise<T>,
  cacheKey: string,
  isCacheHit: boolean
): Promise<T> {
  const monitor = CacheMonitor.getInstance();
  const startTime = Date.now();

  try {
    const result = await operation();
    const responseTime = Date.now() - startTime;

    if (isCacheHit) {
      monitor.recordHit(responseTime);
    } else {
      monitor.recordMiss(responseTime);
    }

    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    monitor.recordMiss(responseTime);
    throw error;
  }
}

/**
 * Executes an asynchronous operation while automatically monitoring cache hit or miss status based on the presence of the cache key.
 *
 * Measures execution time, records cache metrics, and rethrows any errors encountered during the operation.
 *
 * @param operation - The asynchronous function to execute
 * @param cacheKey - The cache key to check for a hit or miss
 * @returns The result of the executed operation
 */
export async function withSmartCacheMonitoring<T>(
  operation: () => Promise<T>,
  cacheKey: string
): Promise<T> {
  const monitor = CacheMonitor.getInstance();
  const startTime = Date.now();

  try {
    // Check if data exists in cache before operation
    const cachedData = await redisCache.get(cacheKey);
    const isCacheHit = cachedData !== null;

    const result = await operation();
    const responseTime = Date.now() - startTime;

    if (isCacheHit) {
      monitor.recordHit(responseTime);
    } else {
      monitor.recordMiss(responseTime);
    }

    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    monitor.recordMiss(responseTime);
    throw error;
  }
}

/**
 * Retrieves current cache metrics and generates performance insights and recommendations.
 *
 * @returns An object containing cache metrics and actionable insights based on hit rate, response time, and cache size.
 */
export async function getCacheInsights(): Promise<{
  metrics: CacheMetrics;
  insights: CacheInsights;
}> {
  const monitor = CacheMonitor.getInstance();
  const metrics = await monitor.getMetrics();

  const insights: CacheInsights = {
    performance:
      metrics.hitRate > 80
        ? "Excellent"
        : metrics.hitRate > 60
          ? "Good"
          : "Needs Improvement",
    recommendations: [],
  };

  if (metrics.hitRate < 60) {
    insights.recommendations.push(
      "Consider increasing cache TTL for frequently accessed data"
    );
    insights.recommendations.push("Review cache invalidation strategy");
  }

  if (metrics.averageResponseTime > 100) {
    insights.recommendations.push("Consider optimizing database queries");
    insights.recommendations.push("Review cache key structure");
  }

  if (metrics.cacheSize > 1000) {
    insights.recommendations.push(
      "Consider implementing cache eviction policies"
    );
  }

  return {
    metrics,
    insights,
  };
}

// Cache warming utilities
export async function warmCollectionCache(slug: string) {
  const monitor = CacheMonitor.getInstance();
  const startTime = Date.now();

  try {
    // Import the query function dynamically to avoid circular dependencies
    const { getCollectionBySlug } = await import("../actions/queries");
    await getCollectionBySlug(slug);

    const responseTime = Date.now() - startTime;
    monitor.recordHit(responseTime); // Warming is considered a hit since we're pre-loading

    console.log(`Warmed cache for collection: ${slug} (${responseTime}ms)`);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    monitor.recordMiss(responseTime);
    console.error(`Cache warming failed for ${slug}:`, error);
  }
}

export async function warmAllCollectionCaches() {
  const monitor = CacheMonitor.getInstance();
  const startTime = Date.now();

  try {
    // Import the query function dynamically to avoid circular dependencies
    const { getCollections } = await import("../actions/queries");
    await getCollections();

    const responseTime = Date.now() - startTime;
    monitor.recordHit(responseTime);

    console.log(`Warmed all collection caches (${responseTime}ms)`);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    monitor.recordMiss(responseTime);
    console.error("Cache warming failed:", error);
  }
}
