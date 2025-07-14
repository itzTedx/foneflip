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

// Wrapper function to monitor cache operations
export async function withCacheMonitoring<T>(
  operation: () => Promise<T>,
  cacheKey: string,
  isCacheHit: boolean,
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

// Utility to get cache performance insights
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
      "Consider increasing cache TTL for frequently accessed data",
    );
    insights.recommendations.push("Review cache invalidation strategy");
  }

  if (metrics.averageResponseTime > 100) {
    insights.recommendations.push("Consider optimizing database queries");
    insights.recommendations.push("Review cache key structure");
  }

  if (metrics.cacheSize > 1000) {
    insights.recommendations.push(
      "Consider implementing cache eviction policies",
    );
  }

  return {
    metrics,
    insights,
  };
}
