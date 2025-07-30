import { unstable_cache as cache } from "next/cache";

import { db, desc, eq } from "@ziron/db";
import { productsTable } from "@ziron/db/schema";

import { redisCache } from "@/modules/cache";
import { CACHE_DURATIONS } from "@/modules/cache/constants";
import { withCacheMonitoring, withSmartCacheMonitoring } from "@/modules/collections/utils/cache-monitor";

import { ProductQueryOptions, ProductQueryResult } from "../types";
import { getFullProductRelations, getProductRelations } from "../utils/helper";
import { CACHE_TAGS, REDIS_KEYS } from "./cache";
import { resolveCollectionId } from "./helpers";

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
      const [product] = await db.query.productsTable.findMany({
        where: eq(productsTable.slug, slug),
        with: getFullProductRelations(),
        orderBy: desc(productsTable.createdAt),
      });

      return product;
    }

    const resolvedCollectionId = await resolveCollectionId(collectionId, collectionSlug);

    // Build where conditions with role-based filtering
    const products = await db.query.productsTable.findMany({
      where: (fields, { eq, and, ilike, or }) => {
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

        return and(...conditions);
      },
      columns: {
        id: true,
        title: true,
        slug: true,
        condition: true,
        sellingPrice: true,
        originalPrice: true,
        sku: true,
        stock: true,
        hasVariant: true,
        createdAt: true,
      },
      with: getProductRelations(),
      orderBy: desc(productsTable.createdAt),
      limit,
      offset,
    });

    const filtered = status
      ? products.filter((p) => (p as { settings?: { status?: string } | null }).settings?.status === status)
      : products;

    return filtered;
  },
  [CACHE_TAGS.PRODUCTS, "dynamic"],
  {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT, CACHE_TAGS.COLLECTION, CACHE_TAGS.MEDIA],
  }
);

export const getProducts = cache(
  async () => {
    // Build where conditions with role-based filtering
    const products = await db.query.productsTable.findMany({
      columns: {
        id: true,
        title: true,
        slug: true,
        condition: true,
        sellingPrice: true,
        originalPrice: true,
        sku: true,
        stock: true,
        hasVariant: true,
        createdAt: true,
      },
      with: {
        images: {
          with: {
            media: {
              with: true,
            },
          },
        },
      },
      orderBy: desc(productsTable.createdAt),
    });

    return products;
  },
  [CACHE_TAGS.PRODUCTS, "dynamic"],
  {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT, CACHE_TAGS.COLLECTION, CACHE_TAGS.MEDIA],
  }
);

// export const getProductById = cache(
//   async (id: string) => {
//     const [product] = await db.query.productsTable.findMany({
//       where: eq(productsTable.id, id),
//       with: getFullProductRelations(),
//       orderBy: desc(productsTable.createdAt),
//     });
//     return product;
//   },
//   [CACHE_TAGS.PRODUCTS, "id"],
//   {
//     revalidate: CACHE_DURATIONS.MEDIUM,
//     tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT, CACHE_TAGS.COLLECTION, CACHE_TAGS.MEDIA],
//   }
// );

export const getProductById = cache(
  async (id: string): Promise<ProductQueryResult> => {
    return withCacheMonitoring(
      async () => {
        // Try Redis first
        const cached = await redisCache.get<ProductQueryResult>(REDIS_KEYS.PRODUCT_BY_ID(id));
        if (cached) {
          return cached;
        }

        // Fallback to database
        const product = await db.query.productsTable.findFirst({
          where: eq(productsTable.id, id),
          with: {
            seo: true,
            settings: true,
            attributes: true,
            collection: true,
            delivery: true,
          },
        });

        // Cache the result
        if (product) {
          await redisCache.set(REDIS_KEYS.PRODUCT_BY_ID(id), product, CACHE_DURATIONS.MEDIUM);
        }

        return product;
      },
      REDIS_KEYS.PRODUCT_BY_ID(id),
      false // This is a miss since we're fetching fresh data
    );
  },
  [CACHE_TAGS.PRODUCT_BY_ID, "id"],
  {
    tags: [CACHE_TAGS.PRODUCT_BY_ID, CACHE_TAGS.PRODUCT, CACHE_TAGS.COLLECTION, CACHE_TAGS.MEDIA],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);
