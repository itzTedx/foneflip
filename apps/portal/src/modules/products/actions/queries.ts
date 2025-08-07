import { unstable_cache as cache } from "next/cache";

import { productSettingsTable, productsTable } from "@ziron/db/schema";
import { and, db, desc, eq, isNull, sql } from "@ziron/db/server";

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

// Helper function to get vendor ID for a user
async function getVendorIdForUser(userId: string): Promise<string | null> {
  const memberRecord = await db.query.members.findFirst({
    where: (members, { eq }) => eq(members.userId, userId),
  });
  return memberRecord?.vendorId || null;
}

// Helper function to get role-specific cache keys
function getRoleSpecificCacheKeys(
  currentUserRole?: string,
  currentUserId?: string,
  vendorId?: string | null
): { productsKey: string; countKey: string } {
  if (currentUserRole === "admin" || currentUserRole === "dev") {
    return {
      productsKey: REDIS_KEYS.PRODUCTS_ADMIN,
      countKey: REDIS_KEYS.PRODUCTS_COUNT_ADMIN,
    };
  }
  if (currentUserRole === "vendor" && vendorId) {
    return {
      productsKey: REDIS_KEYS.PRODUCTS_BY_VENDOR(vendorId),
      countKey: REDIS_KEYS.PRODUCTS_COUNT_BY_VENDOR(vendorId),
    };
  }
  if (currentUserId) {
    return {
      productsKey: REDIS_KEYS.PRODUCTS_BY_USER(currentUserId),
      countKey: REDIS_KEYS.PRODUCTS_COUNT_BY_USER(currentUserId),
    };
  }

  // Fallback to general cache for unauthenticated users
  return {
    productsKey: REDIS_KEYS.PRODUCTS,
    countKey: REDIS_KEYS.PRODUCTS_COUNT,
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
        await redisCache.set(REDIS_KEYS.PRODUCT_BY_SLUG(slug), product, CACHE_DURATIONS.LONG);
      }

      return product;
    }, REDIS_KEYS.PRODUCT_BY_SLUG(slug));
  },
  ["existing-product"],
  {
    tags: [CACHE_TAGS.PRODUCT_BY_SLUG],
    revalidate: CACHE_DURATIONS.LONG,
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

    // Get vendor information for vendor users
    const vendorId = currentUserRole === "vendor" && currentUserId ? await getVendorIdForUser(currentUserId) : null;

    // Build where conditions with role-based filtering
    const products = await db.query.productsTable.findMany({
      where: (fields, { eq, and, ilike, or, exists }) => {
        const conditions = [];

        // Role-based filtering
        if (currentUserRole === "admin" || currentUserRole === "dev") {
          // Admins can see all products - no additional filtering needed
        } else if (currentUserRole === "vendor" && vendorId) {
          // Vendors can only see products from their vendor organization
          conditions.push(eq(fields.vendorId, vendorId));
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
    revalidate: CACHE_DURATIONS.LONG,
    tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT, CACHE_TAGS.COLLECTION, CACHE_TAGS.MEDIA],
  }
);

export const getProducts = async (options: { currentUserId?: string; currentUserRole?: string } = {}) => {
  // If no options provided, get current user context from session
  const userContext = Object.keys(options).length === 0 ? await getCurrentUserContext() : options;

  const { currentUserId, currentUserRole } = userContext;

  // Get vendor information for vendor users
  const vendorId = currentUserRole === "vendor" && currentUserId ? await getVendorIdForUser(currentUserId) : null;

  // Get role-specific cache keys
  const { productsKey } = getRoleSpecificCacheKeys(currentUserRole, currentUserId, vendorId);

  console.log("=== getProducts Debug ===");
  console.log(`Role: ${currentUserRole}`);
  console.log(`User ID: ${currentUserId}`);
  console.log(`Vendor ID: ${vendorId}`);
  console.log(`Cache Key: ${productsKey}`);

  return withCacheMonitoring(
    async () => {
      try {
        // Try Redis first with role-specific key
        const cached = await redisCache.get<ProductQueryResult[]>(productsKey);
        if (cached) {
          console.log(`Cache HIT for key: ${productsKey}, role: ${currentUserRole}, products count: ${cached.length}`);
          // Debug: Log first few product titles to see what's cached
          if (cached.length > 0) {
            console.log(
              `Cached products: ${cached
                .slice(0, 3)
                .map((p) => p.title)
                .join(", ")}`
            );
          }
          return cached;
        }
      } catch (error) {
        console.error("Error fetching products from Redis", error);
      }

      console.log(`Cache MISS for key: ${productsKey}, role: ${currentUserRole}, fetching from DB...`);

      // Build where conditions with role-based filtering
      const products = await db.query.productsTable.findMany({
        where: (fields, { eq, and, isNull }) => {
          const conditions = [isNull(fields.deletedAt)];

          // Role-based filtering
          if (currentUserRole === "admin" || currentUserRole === "dev") {
            // Admins can see all products - no additional filtering needed
            console.log("Admin/Dev: No additional filtering applied");
          } else if (currentUserRole === "vendor" && vendorId) {
            // Vendors can only see products from their vendor organization
            conditions.push(eq(fields.vendorId, vendorId));
            console.log(`Vendor: Filtering by vendorId = ${vendorId}`);
          } else if (currentUserId) {
            // Regular users can only see their own products
            conditions.push(eq(fields.userId, currentUserId));
            console.log(`User: Filtering by userId = ${currentUserId}`);
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
          vendor: {
            with: {
              members: {
                with: {
                  user: true,
                },
              },
              documents: true,
            },
          },
        },
        orderBy: desc(productsTable.createdAt),
      });

      console.log(`DB query completed for role: ${currentUserRole}, products count: ${products.length}`);
      // Debug: Log first few product titles to see what was fetched
      if (products.length > 0) {
        console.log(
          `Fetched products: ${products
            .slice(0, 3)
            .map((p) => p.title)
            .join(", ")}`
        );
      }

      // Cache the result with role-specific key
      await redisCache.set(productsKey, products, CACHE_DURATIONS.LONG);
      console.log(`Cached ${products.length} products with key: ${productsKey}`);

      return products;
    },
    productsKey,
    false // This is a miss since we're fetching fresh data
  );
};

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
            vendor: {
              with: {
                members: {
                  with: {
                    user: true,
                  },
                },
                documents: true,
              },
            },
          },
        });

        // Cache the result (don't fail if cache write fails)
        if (product) {
          try {
            await redisCache.set(REDIS_KEYS.PRODUCT_BY_ID(id), product, CACHE_DURATIONS.LONG);
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
    revalidate: CACHE_DURATIONS.LONG,
  }
);

export const getProductsCount = async (options: { currentUserId?: string; currentUserRole?: string } = {}) => {
  // If no options provided, get current user context from session
  const userContext = Object.keys(options).length === 0 ? await getCurrentUserContext() : options;

  const { currentUserId, currentUserRole } = userContext;

  // Get vendor information for vendor users
  const vendorId = currentUserRole === "vendor" && currentUserId ? await getVendorIdForUser(currentUserId) : null;

  // Get role-specific cache keys
  const { countKey } = getRoleSpecificCacheKeys(currentUserRole, currentUserId, vendorId);

  return withCacheMonitoring(
    async () => {
      try {
        // Try Redis first with role-specific key
        const cached = await redisCache.get<number>(countKey);
        if (cached) {
          return cached;
        }
      } catch (error) {
        console.error("Error fetching products count from Redis", error);
      }

      // Build where conditions with role-based filtering
      let whereCondition: ReturnType<typeof isNull> | ReturnType<typeof and> = isNull(productsTable.deletedAt);

      // Role-based filtering
      if (currentUserRole === "admin" || currentUserRole === "dev") {
        // Admins can see all products - no additional filtering needed
      } else if (currentUserRole === "vendor" && vendorId) {
        // Vendors can only see products from their vendor organization
        whereCondition = and(isNull(productsTable.deletedAt), eq(productsTable.vendorId, vendorId));
      } else if (currentUserId) {
        // Regular users can only see their own products
        whereCondition = and(isNull(productsTable.deletedAt), eq(productsTable.userId, currentUserId));
      }

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(productsTable)
        .where(whereCondition)
        .then((result) => result[0]?.count ?? 0);

      // Cache the result with role-specific key
      await redisCache.set(countKey, countResult, CACHE_DURATIONS.LONG);

      return countResult;
    },
    countKey,
    false // This is a miss since we're fetching fresh data
  );
};

export const getProductsByVendorId = cache(
  async (vendorId: string): Promise<ProductQueryResult[]> => {
    if (!vendorId) {
      return [];
    }

    return withCacheMonitoring(
      async () => {
        try {
          // Try Redis first
          const cached = await redisCache.get<ProductQueryResult[]>(REDIS_KEYS.PRODUCTS_BY_VENDOR(vendorId));
          if (cached) {
            return cached;
          }
        } catch (error) {
          console.error("Error fetching products by vendor from Redis", error);
        }

        // Fallback to database
        const products = await db.query.productsTable.findMany({
          where: and(eq(productsTable.vendorId, vendorId), isNull(productsTable.deletedAt)),
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
            vendor: {
              with: {
                members: {
                  with: {
                    user: true,
                  },
                },
                documents: true,
              },
            },
          },
          orderBy: desc(productsTable.createdAt),
        });

        // Cache the result (don't fail if cache write fails)
        try {
          await redisCache.set(REDIS_KEYS.PRODUCTS_BY_VENDOR(vendorId), products, CACHE_DURATIONS.LONG);
        } catch (error) {
          console.error("Redis cache write error:", error);
        }

        return products;
      },
      REDIS_KEYS.PRODUCTS_BY_VENDOR(vendorId),
      false // This is a miss since we're fetching fresh data from database
    );
  },
  ["products-by-vendor"],
  {
    tags: [CACHE_TAGS.PRODUCTS_BY_VENDOR, CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT, CACHE_TAGS.MEDIA],
    revalidate: CACHE_DURATIONS.LONG,
  }
);
