import { revalidatePath, revalidateTag } from "next/cache";

import { createLog } from "@/lib/utils";
import { redisCache } from "@/modules/cache";
import { CACHE_DURATIONS } from "@/modules/cache/constants";
import { CacheOperationResult, CacheOperationType } from "@/modules/cache/types";
import { CacheInvalidationOptions } from "@/modules/collections/utils/cache-helpers";

import { Product } from "../types";

// Redis cache keys
export const REDIS_KEYS = {
  PRODUCTS: "products:all",
  PRODUCTS_METADATA: "products:all:metadata",
  PRODUCT_BY_SLUG: (slug: string) => `product:${slug}`,
  PRODUCT_BY_ID: (id: string) => `product:id:${id}`,
  PRODUCT_STATS: "products:stats",
  PRODUCT_POPULAR: "products:popular",
  PRODUCT_RECENT: "products:recent",
} as const;

// Cache configuration constants
export const CACHE_TAGS = {
  PRODUCT: "product",
  PRODUCTS: "products",
  PRODUCT_DRAFTS: "product-drafts",
  PRODUCT_ACTIVE: "product-active",
  PRODUCT_ARCHIVED: "product-archived",
  PRODUCT_BY_SLUG: "product-by-slug",
  PRODUCT_BY_ID: "product-by-id",
  PRODUCT_DETAILS: "product-details",
  COLLECTION: "collection",
  MEDIA: "media",
} as const;

// Helper function to revalidate all product-related caches
export const revalidateProductCaches = (productId?: string, slug?: string) => {
  revalidateTag(CACHE_TAGS.PRODUCT);
  revalidateTag(CACHE_TAGS.PRODUCTS);
  revalidateTag(CACHE_TAGS.PRODUCT_DRAFTS);
  revalidateTag(CACHE_TAGS.PRODUCT_ACTIVE);
  revalidateTag(CACHE_TAGS.PRODUCT_ARCHIVED);
  revalidateTag(CACHE_TAGS.PRODUCT_DETAILS);
  revalidateTag(CACHE_TAGS.MEDIA);
  revalidateTag(CACHE_TAGS.COLLECTION);

  if (productId) revalidateTag(`${CACHE_TAGS.PRODUCT_BY_ID}:${productId}`);
  if (slug) revalidateTag(`${CACHE_TAGS.PRODUCT_BY_SLUG}:${slug}`);

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/collections");
  revalidatePath("/collections/[slug]", "page");
};

// Optimistic cache updates
export const updateProductCache = async (product: Product, operation: "create" | "update" | "delete" = "update") => {
  try {
    if (operation === "delete") {
      // Remove from cache
      await redisCache.del(REDIS_KEYS.PRODUCT_BY_SLUG(product.slug), REDIS_KEYS.PRODUCT_BY_ID(product.id));
    } else {
      // Update cache optimistically
      await Promise.all([
        redisCache.set(REDIS_KEYS.PRODUCT_BY_SLUG(product.slug), product, CACHE_DURATIONS.MEDIUM),
        redisCache.set(REDIS_KEYS.PRODUCT_BY_ID(product.id), product, CACHE_DURATIONS.MEDIUM),
      ]);
    }

    // Always invalidate the product list cache
    await redisCache.del(REDIS_KEYS.PRODUCTS);
  } catch (error) {
    console.error("Failed to update product cache:", error);
    // Don't throw - cache updates should not break the main operation
  }
};

const log = createLog("ProductCache");

// Enhanced cache invalidation with Redis
export const invalidateProductCaches = async (productId?: string, slug?: string) => {
  // Invalidate Next.js caches
  revalidateProductCaches(productId, slug);

  // Invalidate Redis caches
  const keysToInvalidate: string[] = [REDIS_KEYS.PRODUCTS];

  if (slug) {
    keysToInvalidate.push(REDIS_KEYS.PRODUCT_BY_SLUG(slug));
  }

  if (productId) {
    keysToInvalidate.push(REDIS_KEYS.PRODUCT_BY_ID(productId));
  }

  await redisCache.del(...keysToInvalidate);
};

/**
 * Updates the cache to reflect the actual state of a product after a database operation.
 *
 * @param product - The product data to synchronize with the cache
 * @param operation - The type of cache operation performed ("create", "update", or "delete")
 * @returns A promise that resolves to the result of the cache operation, indicating success or failure
 */
export async function updateCacheWithResult(
  product: Product,
  operation: CacheOperationType
): Promise<CacheOperationResult> {
  try {
    await updateProductCache(product, operation);
    log.info("Updated cache with actual product data", {
      id: product.id,
      slug: product.slug,
    });
    return { success: true };
  } catch (error) {
    log.warn("Cache update failed after database operation", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown cache error",
    };
  }
}

/**
 * Invalidates and revalidates product caches
 * @param options - Cache invalidation options
 * @returns Promise resolving to cache operation result
 */
export async function invalidateAndRevalidateCaches({
  id,
  slug,
  invalidateAll = false,
}: CacheInvalidationOptions): Promise<CacheOperationResult> {
  try {
    if (invalidateAll) {
      await invalidateProductCaches();
      revalidateProductCaches();
    } else {
      await invalidateProductCaches(id, slug);
      revalidateProductCaches(id, slug);
    }

    log.info("Successfully invalidated and revalidated product caches", {
      id,
      slug,
      invalidateAll,
    });
    return { success: true };
  } catch (error) {
    log.error("Failed to invalidate/revalidate caches", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown cache error",
    };
  }
}
