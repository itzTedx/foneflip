import { revalidatePath, revalidateTag } from "next/cache";

// Cache configuration constants
export const CACHE_TAGS = {
  COLLECTION: "collection",
  COLLECTIONS: "collections",
  COLLECTION_DRAFTS: "collection-drafts",
  COLLECTION_ACTIVE: "collection-active",
  COLLECTION_ARCHIVED: "collection-archived",
  COLLECTION_BY_SLUG: "collection-by-slug",
  COLLECTION_BY_ID: "collection-by-id",
  COLLECTION_DETAILS: "collection-details",
  PRODUCT: "product",
  MEDIA: "media",
} as const;

export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Helper function to revalidate all collection-related caches
export const revalidateCollectionCaches = (
  collectionId?: string,
  slug?: string,
) => {
  revalidateTag(CACHE_TAGS.COLLECTION);
  revalidateTag(CACHE_TAGS.COLLECTIONS);
  revalidateTag(CACHE_TAGS.COLLECTION_DRAFTS);
  revalidateTag(CACHE_TAGS.COLLECTION_ACTIVE);
  revalidateTag(CACHE_TAGS.COLLECTION_ARCHIVED);
  revalidateTag(CACHE_TAGS.COLLECTION_DETAILS);
  revalidateTag(CACHE_TAGS.PRODUCT);
  revalidateTag(CACHE_TAGS.MEDIA);

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
};
