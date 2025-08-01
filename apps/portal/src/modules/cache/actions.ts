"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import redis from "@ziron/redis";

import { env } from "@/lib/env/server";

import { CACHE_TAGS, REDIS_KEYS, redisCache } from "./index";
import { CacheOperationResult } from "./types";

export type CacheRevalidationType = "all" | "collections" | "products" | "media";

interface CacheRevalidationOptions {
  type: CacheRevalidationType;
  collectionId?: string;
  slug?: string;
  productId?: string;
}

/**
 * Server action to revalidate caches based on type
 * Only works in development environment
 */
export async function revalidateCache(options: CacheRevalidationOptions): Promise<CacheOperationResult> {
  // Only allow in development
  if (env.NODE_ENV !== "development") {
    return {
      success: false,
      error: "Cache revalidation only available in development",
    };
  }

  try {
    const { type, collectionId, slug, productId } = options;

    switch (type) {
      case "all":
        await revalidateAllCaches();
        break;

      case "collections":
        await revalidateCollectionCaches(collectionId, slug);
        break;

      case "products":
        await revalidateProductCaches(productId, slug);
        break;

      case "media":
        await revalidateMediaCaches();
        break;

      default:
        return {
          success: false,
          error: "Invalid cache type",
        };
    }

    return {
      success: true,
      error: undefined,
    };
  } catch (error) {
    console.error("Cache revalidation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown cache error",
    };
  }
}

/**
 * Revalidate all caches (collections, products, media)
 */
async function revalidateAllCaches(): Promise<void> {
  // Revalidate all Next.js tags
  Object.values(CACHE_TAGS).forEach((tag) => {
    revalidateTag(tag);
  });

  // Revalidate all paths
  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/collections/[slug]", "page");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/media");

  // Invalidate all Redis keys
  await redisCache.invalidatePattern("collection:*");
  await redisCache.invalidatePattern("collections:*");
  await redisCache.invalidatePattern("product:*");
  await redisCache.invalidatePattern("products:*");
  await redisCache.invalidatePattern("media:*");
}

/**
 * Revalidate collection-related caches
 */
async function revalidateCollectionCaches(collectionId?: string, slug?: string): Promise<void> {
  // Revalidate Next.js collection tags
  revalidateTag(CACHE_TAGS.COLLECTION);
  revalidateTag(CACHE_TAGS.COLLECTIONS);
  revalidateTag(CACHE_TAGS.COLLECTION_DRAFTS);
  revalidateTag(CACHE_TAGS.COLLECTION_ACTIVE);
  revalidateTag(CACHE_TAGS.COLLECTION_ARCHIVED);
  revalidateTag(CACHE_TAGS.COLLECTION_DETAILS);

  if (collectionId) {
    revalidateTag(`${CACHE_TAGS.COLLECTION_BY_ID}:${collectionId}`);
  }
  if (slug) {
    revalidateTag(`${CACHE_TAGS.COLLECTION_BY_SLUG}:${slug}`);
  }

  // Revalidate collection paths
  revalidatePath("/collections");
  revalidatePath("/collections/[slug]", "page");

  // Invalidate Redis collection keys
  const keysToInvalidate: string[] = [REDIS_KEYS.COLLECTIONS];

  if (slug) {
    keysToInvalidate.push(REDIS_KEYS.COLLECTION_BY_SLUG(slug));
  }
  if (collectionId) {
    keysToInvalidate.push(REDIS_KEYS.COLLECTION_BY_ID(collectionId));
  }

  await redisCache.del(...keysToInvalidate);
}

/**
 * Revalidate product-related caches
 */
async function revalidateProductCaches(productId?: string, slug?: string): Promise<void> {
  // Revalidate Next.js product tags
  revalidateTag(CACHE_TAGS.PRODUCT);
  revalidateTag(CACHE_TAGS.MEDIA);

  if (productId) {
    revalidateTag(`product:${productId}`);
  }
  if (slug) {
    revalidateTag(`product:${slug}`);
  }

  // Revalidate product paths
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");

  // Invalidate Redis product keys
  const keysToInvalidate: string[] = [];

  if (productId) {
    keysToInvalidate.push(REDIS_KEYS.PRODUCT_BY_ID(productId));
  }
  if (slug) {
    keysToInvalidate.push(REDIS_KEYS.PRODUCT_BY_SLUG(slug));
  }

  if (keysToInvalidate.length > 0) {
    await redisCache.del(...keysToInvalidate);
  }
}

/**
 * Revalidate media-related caches
 */
async function revalidateMediaCaches(): Promise<void> {
  // Revalidate Next.js media tags
  revalidateTag(CACHE_TAGS.MEDIA);
  revalidateTag(CACHE_TAGS.PRODUCT);
  revalidateTag(CACHE_TAGS.COLLECTION);

  // Revalidate media paths
  revalidatePath("/media");

  // Invalidate Redis media keys
  await redisCache.invalidatePattern("media:*");
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  success: boolean;
  data?: {
    totalKeys: number;
    memoryUsage: string;
    evictedKeys: number;
    uptimeSeconds: number;
    peakMemoryUsage: string;
    maxMemoryPolicy: string;
  };
  error?: string;
}> {
  try {
    const stats = await redisCache.getStats();

    if (!stats) {
      return {
        success: false,
        error: "Failed to get cache statistics",
      };
    }

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Cache stats error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Clear all caches (development only)
 */
export async function clearAllCaches(): Promise<CacheOperationResult> {
  // Only allow in development
  if (env.NODE_ENV !== "development") {
    return {
      success: false,
      error: "Cache clearing only available in development",
    };
  }

  try {
    // Clear all Redis keys
    await redis.flushdb();

    // Revalidate all Next.js tags
    Object.values(CACHE_TAGS).forEach((tag) => {
      revalidateTag(tag);
    });

    // Revalidate all paths
    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/collections/[slug]", "page");
    revalidatePath("/products");
    revalidatePath("/products/[slug]", "page");
    revalidatePath("/media");

    return {
      success: true,
      error: undefined,
    };
  } catch (error) {
    console.error("Cache clearing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown cache error",
    };
  }
}
