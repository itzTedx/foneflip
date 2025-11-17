export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

export const CACHE_TAGS = {
  // Collections
  COLLECTION: "collection",
  COLLECTIONS: "collections",
  COLLECTION_DRAFTS: "collection-drafts",
  COLLECTION_ACTIVE: "collection-active",
  COLLECTION_ARCHIVED: "collection-archived",
  COLLECTION_BY_SLUG: "collection-by-slug",
  COLLECTION_BY_ID: "collection-by-id",
  COLLECTION_DETAILS: "collection-details",

  // Products
  PRODUCT: "product",
  PRODUCTS: "products",
  PRODUCT_DRAFTS: "product-drafts",
  PRODUCT_ACTIVE: "product-active",
  PRODUCT_ARCHIVED: "product-archived",
  PRODUCT_BY_SLUG: "product-by-slug",
  PRODUCT_BY_ID: "product-by-id",
  PRODUCT_DETAILS: "product-details",

  // Media
  MEDIA: "media",

  // Store-specific
  STORE_CATEGORIES: "store-categories",
  STORE_PRODUCTS: "store-products",
  STORE_COLLECTIONS: "store-collections",
} as const;

export const REDIS_KEYS = {
  // Collections
  COLLECTIONS: "collections:all",
  COLLECTIONS_COUNT: "collections:count",
  COLLECTIONS_METADATA: "collections:metadata",
  COLLECTION_BY_SLUG: (slug: string) => `collection:${slug}`,
  COLLECTION_BY_ID: (id: string) => `collection:id:${id}`,
  COLLECTION_STATS: "collections:stats",
  COLLECTION_POPULAR: "collections:popular",
  COLLECTION_RECENT: "collections:recent",

  // Products
  PRODUCTS: "products:all",
  PRODUCTS_METADATA: "products:metadata",
  PRODUCT_BY_SLUG: (slug: string) => `product:${slug}`,
  PRODUCT_BY_ID: (id: string) => `product:id:${id}`,
  PRODUCT_STATS: "products:stats",
  PRODUCT_POPULAR: "products:popular",
  PRODUCT_RECENT: "products:recent",

  // Store-specific
  STORE_CATEGORIES: "store:categories:all",
  STORE_CATEGORIES_WITH_PRODUCTS: "store:categories:with-products",
  STORE_COLLECTION_BY_SLUG: (slug: string) => `store:collection:${slug}`,
  STORE_PRODUCT_BY_SLUG: (slug: string) => `store:product:${slug}`,
} as const;
