import { createLog } from "@/lib/utils";

import type { Collection } from "../types";
import { updateCollectionCache } from "../actions/cache";
import {
  invalidateCollectionCaches,
  revalidateCollectionCaches,
} from "./cache";

const log = createLog("CollectionCache");

// Types for cache operations
export type CacheOperationType = "create" | "update" | "delete";

export interface CacheOperationResult {
  success: boolean;
  error?: string;
}

export interface OptimisticCacheOptions {
  collection: Collection;
  operation: CacheOperationType;
  fallbackId?: string;
  fallbackSlug?: string;
}

export interface CacheInvalidationOptions {
  id?: string;
  slug?: string;
  invalidateAll?: boolean;
}

/**
 * Performs optimistic cache update
 * @param options - Cache operation options
 * @returns Promise resolving to cache operation result
 */
export async function performOptimisticCacheUpdate({
  collection,
  operation,
  fallbackId,
  fallbackSlug,
}: OptimisticCacheOptions): Promise<CacheOperationResult> {
  try {
    await updateCollectionCache(collection, operation);
    log.info("Applied optimistic cache update", {
      id: collection.id || fallbackId,
      operation,
    });
    return { success: true };
  } catch (error) {
    log.warn("Optimistic cache update failed", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown cache error",
    };
  }
}

/**
 * Reverts optimistic cache updates on error
 * @param options - Cache invalidation options
 * @returns Promise resolving to cache operation result
 */
export async function revertOptimisticCache({
  id,
  slug,
}: CacheInvalidationOptions): Promise<CacheOperationResult> {
  try {
    await invalidateCollectionCaches(id, slug);
    log.info("Reverted optimistic cache updates due to error");
    return { success: true };
  } catch (error) {
    log.warn("Failed to revert optimistic cache updates", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown cache error",
    };
  }
}

/**
 * Updates cache with actual database result
 * @param collection - The collection data from database
 * @param operation - The cache operation type
 * @returns Promise resolving to cache operation result
 */
export async function updateCacheWithResult(
  collection: Collection,
  operation: CacheOperationType,
): Promise<CacheOperationResult> {
  try {
    await updateCollectionCache(collection, operation);
    log.info("Updated cache with actual collection data", {
      id: collection.id,
      slug: collection.slug,
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
 * Invalidates and revalidates collection caches
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
      await invalidateCollectionCaches();
      revalidateCollectionCaches();
    } else {
      await invalidateCollectionCaches(id, slug);
      revalidateCollectionCaches(id, slug);
    }

    log.info("Successfully invalidated and revalidated collection caches", {
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
 * Handles cache operations for collection deletion
 * @param collection - The collection being deleted
 * @returns Promise resolving to cache operation result
 */
export async function handleDeletionCacheOperations(
  collection: Collection,
): Promise<CacheOperationResult> {
  try {
    // Optimistic cache removal
    await performOptimisticCacheUpdate({
      collection,
      operation: "delete",
    });

    // Invalidate all related caches
    await invalidateAndRevalidateCaches({
      id: collection.id,
      slug: collection.slug,
    });

    return { success: true };
  } catch (error) {
    log.error("Cache operations failed during deletion", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown cache error",
    };
  }
}
