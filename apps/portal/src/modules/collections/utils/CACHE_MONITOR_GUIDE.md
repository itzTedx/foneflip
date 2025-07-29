# Cache Monitor Usage Guide

The cache monitor provides real-time insights into your caching performance, helping you optimize your application's speed and efficiency.

## 🚀 Quick Start

### Basic Usage

```typescript
import { CacheMonitor, getCacheInsights } from "./cache-monitor";

// Get the singleton instance
const monitor = CacheMonitor.getInstance();

// Your cache operations are automatically monitored
const collections = await getCollections();

// Get current metrics
const metrics = await monitor.getMetrics();
console.log(`Hit Rate: ${metrics.hitRate}%`);
```

## 📊 Available Metrics

The cache monitor tracks these key performance indicators:

- **Hit Rate**: Percentage of cache hits vs total requests
- **Miss Rate**: Percentage of cache misses vs total requests
- **Total Requests**: Total number of cache operations
- **Average Response Time**: Average time per cache operation
- **Cache Size**: Number of keys in Redis
- **Memory Usage**: Redis memory consumption

## 🔧 Usage Patterns

### 1. Real-time Monitoring

```typescript
// In your API routes or server actions
export async function getCollectionsWithMonitoring() {
  const monitor = CacheMonitor.getInstance();

  const startTime = Date.now();
  const collections = await getCollections();
  const responseTime = Date.now() - startTime;

  // Log performance
  const metrics = await monitor.getMetrics();
  console.log(`Request completed in ${responseTime}ms`);
  console.log(`Current hit rate: ${metrics.hitRate}%`);

  return collections;
}
```

### 2. Scheduled Performance Reports

```typescript
// Run this periodically (e.g., every hour)
export async function generatePerformanceReport() {
  const insights = await getCacheInsights();

  console.log("=== Cache Performance Report ===");
  console.log(`Performance: ${insights.insights.performance}`);
  console.log(`Hit Rate: ${insights.metrics.hitRate}%`);
  console.log(`Total Requests: ${insights.metrics.totalRequests}`);

  if (insights.insights.recommendations.length > 0) {
    console.log("\nRecommendations:");
    insights.insights.recommendations.forEach((rec) => console.log(`- ${rec}`));
  }
}
```

### 3. Dashboard Integration

```typescript
// For real-time dashboards
export async function getDashboardMetrics() {
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
```

### 4. Custom Cache Operations

```typescript
import { withCacheMonitoring } from "./cache-monitor";

// Wrap custom cache operations
const customOperation = async () => {
  const cached = await redisCache.get("my:custom:key");
  if (cached) return cached;

  // Fetch from database
  const data = await fetchFromDatabase();
  await redisCache.set("my:custom:key", data, 300);
  return data;
};

// Monitor the operation
const result = await withCacheMonitoring(
  customOperation,
  "my:custom:key",
  false, // Set to true if you know it's a cache hit
);
```

## 📈 Performance Insights

The cache monitor provides automatic recommendations based on your metrics:

### Hit Rate Analysis

- **> 80%**: Excellent performance
- **60-80%**: Good performance
- **< 60%**: Needs improvement

### Response Time Analysis

- **< 50ms**: Excellent
- **50-100ms**: Good
- **> 100ms**: Needs optimization

### Recommendations

The system automatically suggests:

- Increasing TTL for frequently accessed data
- Reviewing cache invalidation strategy
- Optimizing database queries
- Implementing cache eviction policies

## 🛠️ Advanced Usage

### 1. Metrics Reset

```typescript
// Reset metrics for a new monitoring period
const monitor = CacheMonitor.getInstance();
monitor.resetMetrics();
```

### 2. Error Handling

```typescript
// Monitor cache errors
try {
  await redisCache.get("key");
} catch (error) {
  // Still record the miss for monitoring
  monitor.recordMiss(0);
  console.error("Cache error:", error);
}
```

### 3. Performance Comparison

```typescript
// Compare cache vs no-cache performance
export async function comparePerformance() {
  const monitor = CacheMonitor.getInstance();

  // Test without cache
  const start1 = Date.now();
  await getCollections(); // First call - cache miss
  const timeWithoutCache = Date.now() - start1;

  // Test with cache
  const start2 = Date.now();
  await getCollections(); // Second call - cache hit
  const timeWithCache = Date.now() - start2;

  const improvement =
    ((timeWithoutCache - timeWithCache) / timeWithoutCache) * 100;
  console.log(`Cache improvement: ${improvement.toFixed(2)}%`);
}
```

### 4. Cache Warming

```typescript
// Warm frequently accessed data
export async function warmCache() {
  const popularSlugs = ["featured", "new-arrivals", "sale"];

  for (const slug of popularSlugs) {
    try {
      await getCollectionBySlug(slug);
      console.log(`Warmed cache for: ${slug}`);
    } catch (error) {
      console.error(`Failed to warm: ${slug}`, error);
    }
  }
}
```

## 🔍 Debugging

### Common Issues

1. **Low Hit Rate**

   ```typescript
   // Check if cache invalidation is too aggressive
   const insights = await getCacheInsights();
   console.log(insights.insights.recommendations);
   ```

2. **High Response Times**

   ```typescript
   // Monitor specific operations
   const metrics = await monitor.getMetrics();
   if (metrics.averageResponseTime > 100) {
     console.log("Consider optimizing database queries");
   }
   ```

3. **Memory Issues**
   ```typescript
   // Check Redis memory usage
   const stats = await redisCache.getStats();
   console.log(`Memory usage: ${stats?.memoryUsage}`);
   ```

### Debug Commands

```typescript
// Quick health check
const monitor = CacheMonitor.getInstance();
monitor.logMetrics();

// Detailed insights
const insights = await getCacheInsights();
console.log(insights);

// Redis stats
const stats = await redisCache.getStats();
console.log(stats);
```

## 📋 Best Practices

1. **Monitor Regularly**: Check metrics at least daily
2. **Set Alerts**: Monitor for hit rates below 60%
3. **Track Trends**: Watch for performance degradation
4. **Optimize TTL**: Adjust cache durations based on insights
5. **Warm Cache**: Pre-load frequently accessed data
6. **Handle Errors**: Gracefully handle cache failures

## 🎯 Integration Examples

### Next.js API Route

```typescript
// app/api/collections/route.ts
import { getCollections } from "@/modules/collections/actions/queries";
import { CacheMonitor } from "@/modules/collections/utils/cache-monitor";

export async function GET() {
  const monitor = CacheMonitor.getInstance();

  try {
    const collections = await getCollections();

    // Log performance for this request
    const metrics = await monitor.getMetrics();
    console.log(`API hit rate: ${metrics.hitRate}%`);

    return Response.json(collections);
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { error: "Failed to fetch collections" },
      { status: 500 },
    );
  }
}
```

### Server Action

```typescript
// In your server actions
"use server";

import { getCollectionBySlug } from "./queries";
import { CacheMonitor } from "./utils/cache-monitor";

export async function fetchCollection(slug: string) {
  const monitor = CacheMonitor.getInstance();

  const collection = await getCollectionBySlug(slug);

  // Monitor performance
  const metrics = await monitor.getMetrics();
  if (metrics.hitRate < 60) {
    console.warn("Low cache hit rate detected");
  }

  return collection;
}
```

This comprehensive monitoring system will help you maintain optimal cache performance and identify areas for improvement!
