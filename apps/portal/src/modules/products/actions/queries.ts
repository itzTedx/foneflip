import { unstable_cache as cache } from "next/cache";

import { db, desc, eq } from "@ziron/db";
import { productSettingsTable, productsTable } from "@ziron/db/schema";

import { getSession } from "@/lib/auth/server";
import { redisCache } from "@/modules/cache";
import { CACHE_DURATIONS } from "@/modules/cache/constants";
import { withCacheMonitoring, withSmartCacheMonitoring } from "@/modules/collections/utils/cache-monitor";

import { ProductQueryOptions, ProductQueryResult } from "../types";
import { getFullProductRelations, getProductRelations } from "../utils/helper";
import { CACHE_TAGS, REDIS_KEYS } from "./cache";
import { resolveCollectionId } from "./helpers";

// Helper function to get current user context from session
async function getCurrentUserContext() {
  const session = await getSession();
  return {
    currentUserId: session?.user?.id,
    currentUserRole: session?.user?.role,
  };
}

export const existingProduct = cache(
  async (slug: string) => {
    return withSmartCacheMonitoring(async () => {
      // Try Redis first
      const cached = await redisCache.get(REDIS_KEYS.PRODUCT_BY_SLUG(slug));
      if (cached) {
        return cached;
      }

      // Fallback to database
      const product = await db.query.productsTable.findFirst({
        where: eq(productsTable.slug, slug),
      });

      // Cache the result
      if (product) {
        await redisCache.set(REDIS_KEYS.PRODUCT_BY_SLUG(slug), product, CACHE_DURATIONS.MEDIUM);
      }

      return product;
    }, REDIS_KEYS.PRODUCT_BY_SLUG(slug));
  },
  ["existing-product"],
  {
    tags: [CACHE_TAGS.PRODUCT_BY_SLUG],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);

export const fetchProducts = cache(
  async (options: ProductQueryOptions = {}) => {
    const {
      currentUserId,
      currentUserRole,
      status,
      collectionId,
      collectionSlug,
      search,
      condition,
      brand,
      limit = 20,
      offset = 0,
      slug,
    } = options;

    if (slug) {
      const product = await db.query.productsTable.findFirst({
        where: eq(productsTable.slug, slug),
        with: getFullProductRelations(),
      });

      return product;
    }

    const resolvedCollectionId = await resolveCollectionId(collectionId, collectionSlug);

    // Build where conditions with role-based filtering
    const products = await db.query.productsTable.findMany({
      where: (fields, { eq, and, ilike, or, exists }) => {
        const conditions = [];

        // Role-based filtering
        if (currentUserRole === "admin" || currentUserRole === "dev") {
          // Admins can see all products - no additional filtering needed
        } else if (currentUserRole === "vendor" && currentUserId) {
          // Vendors can only see their own products
          conditions.push(eq(fields.userId, currentUserId));
        } else if (currentUserId) {
          // Regular users can only see their own products
          conditions.push(eq(fields.userId, currentUserId));
        }

        // Apply other filters
        if (resolvedCollectionId) {
          conditions.push(eq(fields.collectionId, resolvedCollectionId));
        }

        if (brand) {
          conditions.push(eq(fields.brand, brand));
        }

        if (condition && ["pristine", "excellent", "good", "new"].includes(condition)) {
          conditions.push(eq(fields.condition, condition as "pristine" | "excellent" | "good" | "new"));
        }

        if (search) {
          const q = `%${search}%`;
          conditions.push(
            or(ilike(fields.title, q), ilike(fields.description, q), ilike(fields.brand, q), ilike(fields.sku, q))
          );
        }

        // Filter by status using relation
        if (status) {
          conditions.push(
            exists(
              db
                .select()
                .from(productSettingsTable)
                .where(
                  and(
                    eq(productSettingsTable.productId, fields.id),
                    eq(productSettingsTable.status, status as "active" | "archived" | "draft")
                  )
                )
            )
          );
        }

        return and(...conditions);
      },

      with: getProductRelations(),
      orderBy: desc(productsTable.createdAt),
      limit,
      offset,
    });

    return products;
  },
  [CACHE_TAGS.PRODUCTS, "dynamic"],
  {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT, CACHE_TAGS.COLLECTION, CACHE_TAGS.MEDIA],
  }
);

export const getProducts = cache(
  async (options: { currentUserId?: string; currentUserRole?: string } = {}) => {
    // If no options provided, get current user context from session
    const userContext = Object.keys(options).length === 0 ? await getCurrentUserContext() : options;

    const { currentUserId, currentUserRole } = userContext;

    return withCacheMonitoring(
      async () => {
        try {
          // Try Redis first
          const cached = await redisCache.get<ProductQueryResult[]>(REDIS_KEYS.PRODUCTS);
          if (cached) {
            return cached;
          }
        } catch (error) {
          console.error("Error fetching products from Redis", error);
        }

        // Build where conditions with role-based filtering
        const products = await db.query.productsTable.findMany({
          where: (fields, { eq, and, isNull }) => {
            const conditions = [isNull(fields.deletedAt)];

            // Role-based filtering
            if (currentUserRole === "admin" || currentUserRole === "dev") {
              // Admins can see all products - no additional filtering needed
            } else if (currentUserRole === "vendor" && currentUserId) {
              // Vendors can only see their own products
              conditions.push(eq(fields.userId, currentUserId));
            } else if (currentUserId) {
              // Regular users can only see their own products
              conditions.push(eq(fields.userId, currentUserId));
            }

            return and(...conditions);
          },
          with: {
            seo: true,
            settings: true,
            attributes: {
              with: {
                options: true,
              },
            },
            specifications: true,
            variants: {
              with: {
                options: {
                  with: {
                    option: {
                      with: {
                        attribute: true,
                      },
                    },
                  },
                },
              },
            },
            collection: true,
            delivery: true,
            images: { with: { media: true } },
          },
          orderBy: desc(productsTable.createdAt),
        });

        // Cache the result
        await redisCache.set(REDIS_KEYS.PRODUCTS, products, CACHE_DURATIONS.MEDIUM);

        return products;
      },
      REDIS_KEYS.PRODUCTS,
      false // This is a miss since we're fetching fresh data
    );
  },
  ["get-products"],
  {
    tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT, CACHE_TAGS.COLLECTION, CACHE_TAGS.MEDIA],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);

export const getProductById = cache(
  async (id: string): Promise<ProductQueryResult | undefined> => {
    if (id === "new") {
      return undefined;
    }

    // Try Redis first
    const cached = await redisCache.get<ProductQueryResult>(REDIS_KEYS.PRODUCT_BY_ID(id));
    if (cached) {
      return withCacheMonitoring(
        async () => cached,
        REDIS_KEYS.PRODUCT_BY_ID(id),
        true // This is a cache hit
      );
    }

    // Fallback to database
    return withCacheMonitoring(
      async () => {
        const product = await db.query.productsTable.findFirst({
          where: eq(productsTable.id, id),
          with: {
            seo: true,
            settings: true,
            attributes: {
              with: {
                options: true,
              },
            },
            specifications: true,
            variants: {
              with: {
                options: {
                  with: {
                    option: {
                      with: {
                        attribute: true,
                      },
                    },
                  },
                },
              },
            },
            collection: true,
            delivery: true,
            images: { with: { media: true } },
          },
        });

        // Cache the result (don't fail if cache write fails)
        if (product) {
          try {
            await redisCache.set(REDIS_KEYS.PRODUCT_BY_ID(id), product, CACHE_DURATIONS.MEDIUM);
          } catch (error) {
            console.error("Redis cache write error:", error);
          }
        }

        return product;
      },
      REDIS_KEYS.PRODUCT_BY_ID(id),
      false // This is a miss since we're fetching fresh data from database
    );
  },
  [CACHE_TAGS.PRODUCT_BY_ID, "id"],
  {
    tags: [CACHE_TAGS.PRODUCT_BY_ID, CACHE_TAGS.PRODUCT, CACHE_TAGS.COLLECTION, CACHE_TAGS.MEDIA],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);
