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
