import { revalidatePath, revalidateTag } from "next/cache";

// Cache configuration constants
export const CACHE_TAGS = {
  MEDIA: "media",
  PRODUCT: "product",
  COLLECTION: "collection",
} as const;

export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
} as const;

// Helper function to revalidate media-related caches
export const revalidateMediaCaches = () => {
  revalidateTag(CACHE_TAGS.MEDIA);
  revalidateTag(CACHE_TAGS.PRODUCT);
  revalidateTag(CACHE_TAGS.COLLECTION);
  revalidatePath("/media");
};
