import { z } from "zod";

import { collectionsTable, productsTable } from "@ziron/db/schema";
import { and, asc, db, desc, eq, gte, inArray, isNull, like, lte, sql } from "@ziron/db/server";

import { createTRPCRouter, publicProcedure } from "../trpc";

// Filter schemas
const priceRangeSchema = z.object({
  min: z.number().min(0).optional(),
  max: z.number().min(0).optional(),
});

const sortSchema = z.enum([
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
  "newest",
  "oldest",
  "rating-asc",
  "rating-desc",
]);

const productFiltersSchema = z.object({
  categories: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  priceRange: priceRangeSchema.optional(),
  ratings: z.array(z.number().min(1).max(5)).optional(),
  availability: z.enum(["in-stock", "out-of-stock", "all"]).optional(),
  search: z.string().optional(),
  sortBy: sortSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

const collectionFiltersSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["name-asc", "name-desc", "newest", "oldest"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const storeRouter = createTRPCRouter({
  // Get all collections with basic filtering
  getCollections: publicProcedure.input(collectionFiltersSchema.optional()).query(async ({ input }) => {
    const { search, sortBy = "name-asc", page = 1, limit = 20 } = input || {};
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [isNull(collectionsTable.deletedAt)];

    if (search) {
      whereConditions.push(like(collectionsTable.title, `%${search}%`));
    }

    // Build order by
    let orderBy;
    switch (sortBy) {
      case "name-desc":
        orderBy = [desc(collectionsTable.title)];
        break;
      case "newest":
        orderBy = [desc(collectionsTable.createdAt)];
        break;
      case "oldest":
        orderBy = [asc(collectionsTable.createdAt)];
        break;
      default:
        orderBy = [asc(collectionsTable.title)];
    }

    const collections = await db.query.collectionsTable.findMany({
      where: and(...whereConditions),
      with: {
        collectionMedia: {
          with: {
            media: true,
          },
        },
        products: {
          with: {
            images: {
              with: {
                media: true,
              },
            },
          },
        },
        settings: true,
      },
      orderBy,
      limit,
      offset,
    });

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(collectionsTable)
      .where(and(...whereConditions));

    return {
      collections,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    };
  }),

  // Get filtered products
  getFilteredProducts: publicProcedure.input(productFiltersSchema).query(async ({ input }) => {
    const {
      categories = [],
      brands = [],
      priceRange,
      ratings = [],
      availability = "all",
      search,
      sortBy = "newest",
      page = 1,
      limit = 20,
    } = input;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [isNull(productsTable.deletedAt)];

    // Category filter
    if (categories.length > 0) {
      whereConditions.push(inArray(productsTable.collectionId, categories));
    }

    // Brand filter (assuming brand is stored in a field)
    if (brands.length > 0) {
      // You'll need to adjust this based on your actual schema
      // whereConditions.push(inArray(productsTable.brand, brands));
    }

    // Price range filter
    if (priceRange?.min !== undefined) {
      whereConditions.push(gte(productsTable.sellingPrice, priceRange.min.toString()));
    }
    if (priceRange?.max !== undefined) {
      whereConditions.push(lte(productsTable.sellingPrice, priceRange.max.toString()));
    }

    // Rating filter
    if (ratings.length > 0) {
      // You'll need to adjust this based on your actual schema
      // whereConditions.push(inArray(productsTable.rating, ratings));
    }

    // Availability filter
    if (availability !== "all") {
      const isInStock = availability === "in-stock";
      // You'll need to adjust this based on your actual schema
      // whereConditions.push(eq(productsTable.inStock, isInStock));
    }

    // Search filter
    if (search) {
      whereConditions.push(like(productsTable.title, `%${search}%`));
    }

    // Build order by
    let orderBy;
    switch (sortBy) {
      case "price-asc":
        orderBy = [asc(productsTable.sellingPrice)];
        break;
      case "price-desc":
        orderBy = [desc(productsTable.sellingPrice)];
        break;
      case "name-asc":
        orderBy = [asc(productsTable.title)];
        break;
      case "name-desc":
        orderBy = [desc(productsTable.title)];
        break;
      case "oldest":
        orderBy = [asc(productsTable.createdAt)];
        break;
      case "rating-asc":
      case "rating-desc":
        // You'll need to adjust this based on your actual schema
        orderBy = [desc(productsTable.createdAt)];
        break;
      default:
        orderBy = [desc(productsTable.createdAt)];
    }

    const products = await db.query.productsTable.findMany({
      where: and(...whereConditions),
      with: {
        images: {
          with: {
            media: true,
          },
        },
        collection: {
          with: {
            collectionMedia: {
              with: {
                media: true,
              },
            },
          },
        },
      },
      orderBy,
      limit,
      offset,
    });

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(and(...whereConditions));

    return {
      products,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    };
  }),

  // Get filter options (categories, brands, price ranges, etc.)
  getFilterOptions: publicProcedure.query(async () => {
    // Get all categories
    const categories = await db.query.collectionsTable.findMany({
      where: isNull(collectionsTable.deletedAt),
      columns: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: [asc(collectionsTable.title)],
    });

    // Get price range
    const priceRange = await db
      .select({
        min: sql<number>`min(${productsTable.sellingPrice})`,
        max: sql<number>`max(${productsTable.sellingPrice})`,
      })
      .from(productsTable)
      .where(isNull(productsTable.deletedAt));

    // Get brands (you'll need to adjust based on your schema)
    const brands: string[] = [];

    return {
      categories,
      brands,
      priceRange: {
        min: priceRange[0]?.min || 0,
        max: priceRange[0]?.max || 1000,
      },
      ratings: [1, 2, 3, 4, 5],
    };
  }),

  // Get single collection by slug
  getCollectionBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const collection = await db.query.collectionsTable.findFirst({
      where: eq(collectionsTable.slug, input.slug),
      with: {
        collectionMedia: {
          with: {
            media: true,
          },
        },
        products: {
          with: {
            images: {
              with: {
                media: true,
              },
            },
          },
        },
        settings: true,
      },
    });

    return collection;
  }),

  // Get single product by slug
  getProductBySlug: publicProcedure
    .input(
      z.object({
        collectionSlug: z.string(),
        productSlug: z.string(),
      })
    )
    .query(async ({ input }) => {
      const product = await db.query.productsTable.findFirst({
        where: and(
          eq(productsTable.slug, input.productSlug)
          // You might need to join with collections to filter by collectionSlug
        ),
        with: {
          images: {
            with: {
              media: true,
            },
          },
          collection: {
            with: {
              collectionMedia: {
                with: {
                  media: true,
                },
              },
            },
          },
        },
      });

      return product;
    }),
});
