import { revalidatePath, revalidateTag } from "next/cache";

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
