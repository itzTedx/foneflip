# Collections Caching Implementation

This document describes the comprehensive caching implementation for the collections feature, combining Redis and Next.js built-in caching.

## Overview

The caching system implements a multi-layer approach:

1. **Redis Cache**: Fast in-memory caching for frequently accessed data
2. **Next.js Cache**: Built-in caching with automatic revalidation
3. **Cache Monitoring**: Performance tracking and insights

## Architecture

### Cache Layers

```
Request → Redis Cache → Next.js Cache → Database
   ↑         ↑            ↑
   └─────────┴────────────┘
   Cache Invalidation
```

### Cache Keys

- `collections:all` - All collections list
- `collection:{slug}` - Individual collection by slug
- `collection:id:{id}` - Individual collection by ID
- `collections:stats` - Cache statistics

## Cache Durations

- **SHORT**: 60 seconds (1 minute) - For frequently changing data
- **MEDIUM**: 300 seconds (5 minutes) - For moderately changing data
- **LONG**: 3600 seconds (1 hour) - For stable data
- **VERY_LONG**: 86400 seconds (24 hours) - For rarely changing data

## Usage

### Basic Queries

```typescript
import {
  getCollections,
  getCollectionBySlug,
  getCollectionById,
} from "./actions/queries";

// Get all collections (cached)
const collections = await getCollections();

// Get collection by slug (cached)
const collection = await getCollectionBySlug("my-collection");

// Get collection by ID (cached)
const collection = await getCollectionById("uuid-here");
```

### Cache Invalidation

```typescript
import {
  invalidateAllCollectionCaches,
  invalidateCollectionCaches,
} from "./utils/cache";

// Invalidate specific collection
await invalidateCollectionCaches("collection-id", "collection-slug");

// Invalidate all collection caches
await invalidateAllCollectionCaches();
```

### Cache Monitoring

```typescript
import { CacheMonitor, getCacheInsights } from "./utils/cache-monitor";

// Get cache metrics
const monitor = CacheMonitor.getInstance();
const metrics = await monitor.getMetrics();

// Get performance insights
const insights = await getCacheInsights();
```

## Cache Tags

The system uses Next.js cache tags for automatic invalidation:

- `collection` - General collection cache
- `collections` - Collections list cache
- `collection-by-slug` - Individual collection by slug
- `collection-by-id` - Individual collection by ID
- `collection-active` - Active collections only
- `collection-drafts` - Draft collections
- `collection-archived` - Archived collections

## Performance Benefits

1. **Redis Cache**: Sub-millisecond response times for cached data
2. **Next.js Cache**: Automatic revalidation and edge caching
3. **Reduced Database Load**: Fewer database queries
4. **Better User Experience**: Faster page loads

## Monitoring and Debugging

### Cache Metrics

- Hit rate percentage
- Miss rate percentage
- Total requests
- Average response time
- Cache size (number of keys)
- Memory usage

### Cache Insights

The system provides automatic recommendations based on performance metrics:

- **Hit Rate < 60%**: Suggests increasing TTL or reviewing invalidation strategy
- **Response Time > 100ms**: Suggests query optimization
- **Cache Size > 1000 keys**: Suggests implementing eviction policies

## Best Practices

1. **Cache Invalidation**: Always invalidate caches when data changes
2. **TTL Strategy**: Use appropriate TTL based on data volatility
3. **Monitoring**: Regularly check cache performance metrics
4. **Error Handling**: Graceful fallback when Redis is unavailable
5. **Memory Management**: Monitor Redis memory usage

## Configuration

### Environment Variables

Ensure these are set in your environment:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

### Redis Configuration

The Redis client is configured with:

- Lazy connection
- Automatic reconnection
- Error handling
- Memory optimization

## Troubleshooting

### Common Issues

1. **Cache Misses**: Check if data exists in database
2. **High Response Times**: Review database queries
3. **Memory Issues**: Monitor Redis memory usage
4. **Connection Errors**: Verify Redis connection settings

### Debug Commands

```typescript
// Check cache status
const stats = await redisCache.getStats();

// Log cache metrics
CacheMonitor.getInstance().logMetrics();

// Get cache insights
const insights = await getCacheInsights();
```

## Future Enhancements

1. **Cache Warming**: Pre-load frequently accessed data
2. **Distributed Caching**: Redis cluster for high availability
3. **Cache Compression**: Reduce memory usage
4. **Advanced Analytics**: Detailed performance tracking
5. **Automatic Optimization**: Self-tuning cache parameters
