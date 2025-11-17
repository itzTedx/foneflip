import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS, REDIS_KEYS, redisCache } from "./index";

// Helper function to revalidate all collection-related caches
export const revalidateCollectionCaches = (collectionId?: string, slug?: string) => {
  revalidateTag(CACHE_TAGS.COLLECTION);
  revalidateTag(CACHE_TAGS.COLLECTIONS);
  revalidateTag(CACHE_TAGS.COLLECTION_DRAFTS);
  revalidateTag(CACHE_TAGS.COLLECTION_ACTIVE);
  revalidateTag(CACHE_TAGS.COLLECTION_ARCHIVED);
  revalidateTag(CACHE_TAGS.COLLECTION_DETAILS);
  revalidateTag(CACHE_TAGS.PRODUCT);
  revalidateTag(CACHE_TAGS.MEDIA);
  revalidateTag(CACHE_TAGS.STORE_CATEGORIES);
  revalidateTag(CACHE_TAGS.STORE_COLLECTIONS);

  if (collectionId) {
    revalidateTag(`${CACHE_TAGS.COLLECTION_BY_ID}:${collectionId}`);
  }
  if (slug) {
    revalidateTag(`${CACHE_TAGS.COLLECTION_BY_SLUG}:${slug}`);
  }

  revalidatePath("/collections");
  revalidatePath("/collections/[slug]", "page");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/shop");
  revalidatePath("/shop/[category]/[product]", "page");
};

// Enhanced cache invalidation with Redis
export const invalidateCollectionCaches = async (collectionId?: string, slug?: string) => {
  // Invalidate Next.js caches
  revalidateCollectionCaches(collectionId, slug);

  // Invalidate Redis caches
  const keysToInvalidate: string[] = [
    REDIS_KEYS.COLLECTIONS,
    REDIS_KEYS.COLLECTIONS_COUNT,
    REDIS_KEYS.COLLECTIONS_METADATA,
    REDIS_KEYS.STORE_CATEGORIES,
    REDIS_KEYS.STORE_CATEGORIES_WITH_PRODUCTS,
  ];

  if (slug) {
    keysToInvalidate.push(REDIS_KEYS.COLLECTION_BY_SLUG(slug));
    keysToInvalidate.push(REDIS_KEYS.STORE_COLLECTION_BY_SLUG(slug));
  }

  if (collectionId) {
    keysToInvalidate.push(REDIS_KEYS.COLLECTION_BY_ID(collectionId));
  }

  await redisCache.del(...keysToInvalidate);
};

// Store-specific cache invalidation
export const invalidateStoreCaches = async (collectionId?: string, slug?: string) => {
  // Invalidate store-specific Next.js caches
  revalidateTag(CACHE_TAGS.STORE_CATEGORIES);
  revalidateTag(CACHE_TAGS.STORE_COLLECTIONS);
  revalidateTag(CACHE_TAGS.STORE_PRODUCTS);

  if (collectionId) {
    revalidateTag(`${CACHE_TAGS.COLLECTION_BY_ID}:${collectionId}`);
  }
  if (slug) {
    revalidateTag(`${CACHE_TAGS.COLLECTION_BY_SLUG}:${slug}`);
  }

  // Invalidate store paths
  revalidatePath("/shop");
  revalidatePath("/shop/[category]", "page");
  revalidatePath("/shop/[category]/[product]", "page");

  // Invalidate Redis store keys
  const keysToInvalidate: string[] = [REDIS_KEYS.STORE_CATEGORIES, REDIS_KEYS.STORE_CATEGORIES_WITH_PRODUCTS];

  if (slug) {
    keysToInvalidate.push(REDIS_KEYS.STORE_COLLECTION_BY_SLUG(slug));
  }

  await redisCache.del(...keysToInvalidate);
};

// Bulk cache invalidation
export const invalidateAllCollectionCaches = async () => {
  // Invalidate all Next.js collection tags
  Object.values(CACHE_TAGS).forEach((tag) => {
    revalidateTag(tag);
  });

  // Invalidate all Redis collection keys
  await redisCache.invalidatePattern("collection:*");
  await redisCache.invalidatePattern("collections:*");
  await redisCache.invalidatePattern("store:*");
};

// Cache invalidation functions
export const invalidateCollectionCache = async (slug?: string, id?: string) => {
  const keysToInvalidate: string[] = [
    REDIS_KEYS.COLLECTIONS,
    REDIS_KEYS.COLLECTIONS_COUNT,
    REDIS_KEYS.COLLECTIONS_METADATA,
    REDIS_KEYS.STORE_CATEGORIES,
    REDIS_KEYS.STORE_CATEGORIES_WITH_PRODUCTS,
  ];

  if (slug) {
    keysToInvalidate.push(REDIS_KEYS.COLLECTION_BY_SLUG(slug));
    keysToInvalidate.push(REDIS_KEYS.STORE_COLLECTION_BY_SLUG(slug));
  }

  if (id) {
    keysToInvalidate.push(REDIS_KEYS.COLLECTION_BY_ID(id));
  }

  await redisCache.del(...keysToInvalidate);
};
