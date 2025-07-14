import { getCollectionBySlug, getCollections } from "../actions/queries";
import { redisCache } from "./cache";
import {
  CacheMonitor,
  getCacheInsights,
  withCacheMonitoring,
} from "./cache-monitor";

// Example 1: Basic cache monitoring
export async function monitorBasicCacheUsage() {
  const monitor = CacheMonitor.getInstance();

  // Your normal cache operations will be monitored automatically
  const collections = await getCollections();
  const collection = await getCollectionBySlug("example-collection");

  // Get current metrics
  const metrics = await monitor.getMetrics();
  console.log("Current cache performance:", metrics);

  // Log metrics to console
  monitor.logMetrics();
}

// Example 2: Using withCacheMonitoring wrapper for custom operations
export async function monitorCustomCacheOperation() {
  const customOperation = async () => {
    // Simulate a custom cache operation
    const cached = await redisCache.get("custom:key");
    if (cached) {
      return cached;
    }

    // Simulate database query
    await new Promise((resolve) => setTimeout(resolve, 100));
    const data = { id: 1, name: "Custom Data" };

    // Cache the result
    await redisCache.set("custom:key", data, 300);
    return data;
  };

  // Monitor the operation
  const result = await withCacheMonitoring(
    customOperation,
    "custom:key",
    false, // Set to true if you know it's a cache hit
  );

  return result;
}

// Example 3: Performance monitoring in API routes
export async function monitorAPIPerformance() {
  const monitor = CacheMonitor.getInstance();

  // Simulate API request
  const startTime = Date.now();

  try {
    // Your API logic here
    const collections = await getCollections();
    const activeCollections = collections.filter((c) => !c.deletedAt);

    const responseTime = Date.now() - startTime;

    // Log performance metrics
    const metrics = await monitor.getMetrics();
    console.log(`API Response Time: ${responseTime}ms`);
    console.log(`Cache Hit Rate: ${metrics.hitRate}%`);

    return activeCollections;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Example 4: Scheduled cache monitoring
export async function scheduledCacheMonitoring() {
  const monitor = CacheMonitor.getInstance();

  // Get comprehensive insights
  const insights = await getCacheInsights();

  console.log("=== Cache Performance Report ===");
  console.log(`Performance: ${insights.insights.performance}`);
  console.log(`Hit Rate: ${insights.metrics.hitRate}%`);
  console.log(`Total Requests: ${insights.metrics.totalRequests}`);
  console.log(
    `Average Response Time: ${insights.metrics.averageResponseTime}ms`,
  );

  if (insights.insights.recommendations.length > 0) {
    console.log("\nRecommendations:");
    insights.insights.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  // Reset metrics for next period (optional)
  // monitor.resetMetrics();
}

// Example 5: Real-time monitoring dashboard data
export async function getDashboardData() {
  const monitor = CacheMonitor.getInstance();
  const metrics = await monitor.getMetrics();

  return {
    performance: {
      hitRate: metrics.hitRate,
      missRate: metrics.missRate,
      averageResponseTime: metrics.averageResponseTime,
    },
    usage: {
      totalRequests: metrics.totalRequests,
      cacheSize: metrics.cacheSize,
      memoryUsage: metrics.memoryUsage,
    },
    timestamp: new Date().toISOString(),
  };
}

// Example 6: Cache warming with monitoring
export async function warmCacheWithMonitoring() {
  const monitor = CacheMonitor.getInstance();

  console.log("Starting cache warming...");

  // Warm frequently accessed collections
  const popularSlugs = ["featured", "new-arrivals", "sale"];

  for (const slug of popularSlugs) {
    const startTime = Date.now();

    try {
      await getCollectionBySlug(slug);
      const responseTime = Date.now() - startTime;

      console.log(`Warmed cache for ${slug} in ${responseTime}ms`);
    } catch (error) {
      console.error(`Failed to warm cache for ${slug}:`, error);
    }
  }

  // Get warming results
  const metrics = await monitor.getMetrics();
  console.log(`Cache warming completed. Hit rate: ${metrics.hitRate}%`);
}

// Example 7: Error monitoring
export async function monitorCacheErrors() {
  const monitor = CacheMonitor.getInstance();

  try {
    // Simulate cache error
    await redisCache.get("non-existent-key");
  } catch (error) {
    console.error("Cache error detected:", error);

    // Still record the miss for monitoring
    monitor.recordMiss(0);
  }

  // Get error-adjusted metrics
  const metrics = await monitor.getMetrics();
  console.log("Metrics after error:", metrics);
}

// Example 8: Performance comparison
export async function compareCachePerformance() {
  const monitor = CacheMonitor.getInstance();

  // Test without cache
  console.log("Testing without cache...");
  const startTime1 = Date.now();
  await getCollections(); // This will miss cache
  const timeWithoutCache = Date.now() - startTime1;

  // Test with cache
  console.log("Testing with cache...");
  const startTime2 = Date.now();
  await getCollections(); // This should hit cache
  const timeWithCache = Date.now() - startTime2;

  const metrics = await monitor.getMetrics();

  console.log("=== Performance Comparison ===");
  console.log(`Without cache: ${timeWithoutCache}ms`);
  console.log(`With cache: ${timeWithCache}ms`);
  console.log(
    `Improvement: ${(((timeWithoutCache - timeWithCache) / timeWithoutCache) * 100).toFixed(2)}%`,
  );
  console.log(`Current hit rate: ${metrics.hitRate}%`);
}
