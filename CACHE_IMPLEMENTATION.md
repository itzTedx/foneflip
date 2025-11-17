# Caching Implementation for Store and Portal

This document describes the comprehensive caching implementation that provides fast access to categories/collections data in the store app and automatic cache invalidation when admin changes details in the portal.

## Architecture Overview

The caching system implements a multi-layer approach:

1. **Next.js Built-in Cache**: Automatic caching with revalidation
2. **Cache Monitoring**: Performance tracking and insights
3. **Automatic Invalidation**: Cache invalidation when data changes in portal

## Cache Layers

```
Request → Next.js Cache → Database
   ↑         ↑
   └─────────┘
   Cache Invalidation
```

## Implementation Details

### 1. Store App Caching (`apps/store/src/lib/cache.ts`)

The store app uses Next.js `unstable_cache` to cache categories with products:

```typescript
export const storeCache = {
  // Get categories with products (for shop page)
  getCategoriesWithProducts: cache(
    async () => {
      // Fetch from database with the same query as the original shop page
      const categories = await db.query.collectionsTable.findMany({
        with: {
          collectionMedia: { with: { media: true } },
          products: {
            with: {
              images: { with: { media: true } },
            },
          },
          settings: true,
        },
        orderBy: (collections, { asc }) => [asc(collections.sortOrder)],
      });
      
      return categories;
    },
    ["store-categories-with-products"],
    {
      tags: ["store-categories", "store-collections"],
      revalidate: 3600, // 1 hour
    }
  ),
};
```

### 2. Portal Cache Invalidation (`apps/portal/src/modules/collections/actions/cache.ts`)

The portal automatically invalidates store caches when admin changes collection details:

```typescript
export const invalidateCollectionCaches = async (collectionId?: string, slug?: string) => {
  // Invalidate Next.js caches
  revalidateCollectionCaches(collectionId, slug);

  // Invalidate Redis caches
  const keysToInvalidate: string[] = [
    REDIS_KEYS.COLLECTIONS,
    REDIS_KEYS.COLLECTIONS_COUNT,
    REDIS_KEYS.COLLECTIONS_METADATA,
    // Store-specific keys
    "store:categories:with-products",
  ];

  if (slug) {
    keysToInvalidate.push(REDIS_KEYS.COLLECTION_BY_SLUG(slug));
    keysToInvalidate.push(`store:collection:${slug}`);
  }

  await redisCache.del(...keysToInvalidate);
  
  // Also invalidate store patterns
  await redisCache.invalidatePattern("store:*");
};
```

### 3. Cache Monitoring (`apps/portal/src/modules/collections/components/cache-monitor.tsx`)

A comprehensive monitoring component that shows:

- Hit rate percentage
- Total requests and misses
- Average response time
- Cache size and memory usage
- Redis health status
- Performance recommendations

## Usage

### Store App

The shop page now uses cached categories:

```typescript
// apps/store/src/app/(root)/shop/page.tsx
import { storeCache } from "@/lib/cache";

export default async function ShopPage() {
  const categories = await storeCache.getCategoriesWithProducts();
  
  return (
    <main className="container mx-auto max-w-7xl space-y-12 py-12">
      {categories.map((category) => {
        // ... render categories
      })}
    </main>
  );
}
```

### Portal Admin

When admin changes collection details, caches are automatically invalidated:

```typescript
// This happens automatically in collection mutations
await invalidateCollectionCaches(collection.id, collection.slug);
```

### Cache Monitoring

Add the cache monitor to any portal page:

```typescript
import { CacheMonitor } from "@/modules/collections/components/cache-monitor";

export default function CollectionsPage() {
  return (
    <div>
      <CacheMonitor />
      {/* Other content */}
    </div>
  );
}
```

## Cache Tags

The system uses Next.js cache tags for automatic invalidation:

- `store-categories` - Store categories cache
- `store-collections` - Store collections cache
- `store-products` - Store products cache
- `collection` - General collection cache
- `collections` - Collections list cache
- `collection-by-slug` - Individual collection by slug
- `collection-by-id` - Individual collection by ID

## Cache Keys

Redis cache keys for different data types:

- `store:categories:with-products` - Store categories with products
- `store:collection:{slug}` - Individual store collection
- `collections:all` - All collections
- `collection:{slug}` - Individual collection by slug
- `collection:id:{id}` - Individual collection by ID

## Performance Benefits

1. **Faster Page Loads**: Cached data loads in milliseconds
2. **Reduced Database Load**: Fewer database queries
3. **Better User Experience**: Consistent response times
4. **Automatic Invalidation**: No stale data when admin makes changes

## Cache Durations

- **SHORT**: 60 seconds (1 minute) - For frequently changing data
- **MEDIUM**: 300 seconds (5 minutes) - For moderately changing data
- **LONG**: 3600 seconds (1 hour) - For stable data (used for categories)
- **VERY_LONG**: 86400 seconds (24 hours) - For rarely changing data

## Monitoring and Debugging

### Cache Metrics

The cache monitor provides:

- Hit rate percentage
- Miss rate percentage
- Total requests
- Average response time
- Cache size (number of keys)
- Memory usage

### Cache Insights

Automatic recommendations based on performance metrics:

- **Hit Rate < 60%**: Suggests increasing TTL or reviewing invalidation strategy
- **Response Time > 100ms**: Suggests query optimization
- **Cache Size > 1000 keys**: Suggests implementing eviction policies

## Best Practices

1. **Cache Invalidation**: Always invalidate caches when data changes
2. **TTL Strategy**: Use appropriate TTL based on data volatility
3. **Monitoring**: Regularly check cache performance metrics
4. **Error Handling**: Graceful fallback when cache is unavailable
5. **Memory Management**: Monitor cache memory usage

## Configuration

### Environment Variables

Ensure Redis is configured in your environment:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

### Adding Cache to New Features

To add caching to new features:

1. Create a cached query function using `unstable_cache`
2. Add appropriate cache tags
3. Set appropriate revalidation time
4. Add cache invalidation to mutations
5. Update cache monitoring if needed

## Troubleshooting

### Common Issues

1. **Stale Data**: Ensure cache invalidation is called after mutations
2. **High Memory Usage**: Monitor Redis memory and implement eviction policies
3. **Low Hit Rate**: Review TTL settings and invalidation strategy
4. **Slow Response Times**: Optimize database queries

### Debug Commands

```typescript
// Check cache health
const health = await checkCacheHealth();

// Invalidate all caches
await invalidateAllCollectionCaches();

// Get cache insights
const insights = await getCacheInsights();
```

## Future Enhancements

1. **Redis Integration**: Add Redis caching layer for even faster access
2. **Cache Warming**: Pre-populate cache with frequently accessed data
3. **Distributed Caching**: Support for multiple Redis instances
4. **Advanced Monitoring**: Real-time cache metrics and alerts
5. **Cache Analytics**: Detailed performance analytics and reporting 