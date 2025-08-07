import { revalidatePath, revalidateTag } from "next/cache";

import { createLog } from "@/lib/utils";
import { redisCache, revalidateProductEditingForms } from "@/modules/cache";
import { CACHE_DURATIONS } from "@/modules/cache/constants";
import { CacheOperationResult, CacheOperationType } from "@/modules/cache/types";
import { CacheInvalidationOptions } from "@/modules/collections/utils/cache-helpers";

import { Product } from "../types";

// Redis cache keys
export const REDIS_KEYS = {
  PRODUCTS: "products:all",
  PRODUCTS_METADATA: "products:all:metadata",
  PRODUCTS_COUNT: "products:count",
  PRODUCTS_BY_USER: (userId: string) => `products:user:${userId}`,
  PRODUCTS_COUNT_BY_USER: (userId: string) => `products:count:user:${userId}`,
  PRODUCTS_BY_VENDOR: (vendorId: string) => `products:vendor:${vendorId}`,
  PRODUCTS_COUNT_BY_VENDOR: (vendorId: string) => `products:count:vendor:${vendorId}`,
  PRODUCTS_ADMIN: "products:admin:all",
  PRODUCTS_COUNT_ADMIN: "products:count:admin",
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
  PRODUCTS_BY_VENDOR: "products-by-vendor",
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
  revalidateTag(CACHE_TAGS.PRODUCTS_BY_VENDOR);
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
      // Also invalidate related caches
      await redisCache.del(REDIS_KEYS.PRODUCT_STATS, REDIS_KEYS.PRODUCT_POPULAR, REDIS_KEYS.PRODUCT_RECENT);
    } else {
      // Update cache optimistically
      await Promise.all([
        redisCache.set(REDIS_KEYS.PRODUCT_BY_SLUG(product.slug), product, CACHE_DURATIONS.MEDIUM),
        redisCache.set(REDIS_KEYS.PRODUCT_BY_ID(product.id), product, CACHE_DURATIONS.MEDIUM),
      ]);
    }

    // Always invalidate all product list and count caches (role-specific and shared)
    await invalidateProductCaches(product.id, product.slug);
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
  const keysToInvalidate: string[] = [
    REDIS_KEYS.PRODUCTS,
    REDIS_KEYS.PRODUCTS_COUNT,
    REDIS_KEYS.PRODUCTS_ADMIN,
    REDIS_KEYS.PRODUCTS_COUNT_ADMIN,
  ];

  // Invalidate pattern-based keys for all users and vendors
  try {
    // Use invalidatePattern for user and vendor caches
    await Promise.all([
      redisCache.invalidatePattern("products:user:*"),
      redisCache.invalidatePattern("products:vendor:*"),
      redisCache.invalidatePattern("products:count:user:*"),
      redisCache.invalidatePattern("products:count:vendor:*"),
    ]);
  } catch (error) {
    console.error("Error invalidating pattern-based cache keys:", error);
    // Continue with basic invalidation even if pattern matching fails
  }

  if (slug) {
    keysToInvalidate.push(REDIS_KEYS.PRODUCT_BY_SLUG(slug));
  }

  if (productId) {
    keysToInvalidate.push(REDIS_KEYS.PRODUCT_BY_ID(productId));
  }

  await redisCache.del(...keysToInvalidate);

  // Also revalidate product editing forms specifically
  revalidateProductEditingForms();
};

// Helper function to invalidate cache for specific user/vendor
export const invalidateUserProductCaches = async (userId: string, vendorId?: string) => {
  const keysToInvalidate: string[] = [REDIS_KEYS.PRODUCTS_BY_USER(userId), REDIS_KEYS.PRODUCTS_COUNT_BY_USER(userId)];

  if (vendorId) {
    keysToInvalidate.push(REDIS_KEYS.PRODUCTS_BY_VENDOR(vendorId), REDIS_KEYS.PRODUCTS_COUNT_BY_VENDOR(vendorId));
  }

  await redisCache.del(...keysToInvalidate);
};

// Debug function to clear all product caches
export const clearAllProductCaches = async () => {
  try {
    await Promise.all([
      redisCache.invalidatePattern("products:*"),
      redisCache.del(
        REDIS_KEYS.PRODUCTS,
        REDIS_KEYS.PRODUCTS_COUNT,
        REDIS_KEYS.PRODUCTS_ADMIN,
        REDIS_KEYS.PRODUCTS_COUNT_ADMIN
      ),
    ]);
    console.log("All product caches cleared");
    return { success: true, message: "All product caches cleared" };
  } catch (error) {
    console.error("Error clearing product caches:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
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

/**
 * Server action to clear all product caches (for debugging)
 */
export async function clearProductCachesAction() {
  "use server";

  try {
    const result = await clearAllProductCaches();
    return result;
  } catch (error) {
    console.error("Error in clearProductCachesAction:", error);
    return { success: false, error: "Failed to clear caches" };
  }
}
