import { z } from "zod";

import { collectionsTable, productsTable } from "@ziron/db/schema";
import { and, asc, db, desc, eq, inArray, isNull, like, or, sql } from "@ziron/db/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

// Admin filter schemas
const adminProductFiltersSchema = z.object({
  categories: z.array(z.string()).optional(),
  search: z.string().optional(),
  status: z.enum(["active", "draft", "archived", "all"]).optional(),
  sortBy: z.enum(["name-asc", "name-desc", "newest", "oldest", "price-asc", "price-desc"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

const adminCollectionFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["active", "draft", "archived", "all"]).optional(),
  sortBy: z.enum(["name-asc", "name-desc", "newest", "oldest"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const portalRouter = createTRPCRouter({
  // Get collections for admin with filtering
  getCollections: protectedProcedure.input(adminCollectionFiltersSchema.optional()).query(async ({ input, ctx }) => {
    const { search, status = "all", sortBy = "name-asc", page = 1, limit = 20 } = input || {};
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    // Status filter
    if (status !== "all") {
      switch (status) {
        case "active":
          whereConditions.push(isNull(collectionsTable.deletedAt));
          break;
        case "draft":
          // You'll need to adjust based on your schema
          break;
        case "archived":
          whereConditions.push(eq(collectionsTable.deletedAt, new Date()));
          break;
      }
    } else {
      // Show all (including deleted)
    }

    // Search filter
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
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
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
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

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

  // Get products for admin with filtering
  getProducts: protectedProcedure.input(adminProductFiltersSchema.optional()).query(async ({ input, ctx }) => {
    const { categories = [], search, status = "all", sortBy = "newest", page = 1, limit = 20 } = input || {};
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    // Status filter
    if (status !== "all") {
      switch (status) {
        case "active":
          whereConditions.push(isNull(productsTable.deletedAt));
          break;
        case "draft":
          // You'll need to adjust based on your schema
          break;
        case "archived":
          whereConditions.push(eq(productsTable.deletedAt, new Date()));
          break;
      }
    } else {
      // Show all (including deleted)
    }

    // Category filter
    if (categories.length > 0) {
      whereConditions.push(inArray(productsTable.collectionId, categories));
    }

    // Search filter
    if (search) {
      whereConditions.push(
        or(like(productsTable.title, `%${search}%`), like(productsTable.description, `%${search}%`))
      );
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
      default:
        orderBy = [desc(productsTable.createdAt)];
    }

    const products = await db.query.productsTable.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
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
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

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

  // Get collection by ID for admin
  getCollectionById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const collection = await db.query.collectionsTable.findFirst({
      where: eq(collectionsTable.id, input.id),
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

  // Get product by ID for admin
  getProductById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const product = await db.query.productsTable.findFirst({
      where: eq(productsTable.id, input.id),
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

  // Get admin dashboard stats
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    // Get total collections
    const totalCollections = await db
      .select({ count: sql<number>`count(*)` })
      .from(collectionsTable)
      .where(isNull(collectionsTable.deletedAt));

    // Get total products
    const totalProducts = await db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(isNull(productsTable.deletedAt));

    // Get recent collections
    const recentCollections = await db.query.collectionsTable.findMany({
      where: isNull(collectionsTable.deletedAt),
      orderBy: [desc(collectionsTable.createdAt)],
      limit: 5,
      with: {
        collectionMedia: {
          with: {
            media: true,
          },
        },
      },
    });

    // Get recent products
    const recentProducts = await db.query.productsTable.findMany({
      where: isNull(productsTable.deletedAt),
      orderBy: [desc(productsTable.createdAt)],
      limit: 5,
      with: {
        images: {
          with: {
            media: true,
          },
        },
        collection: true,
      },
    });

    return {
      stats: {
        totalCollections: totalCollections[0]?.count || 0,
        totalProducts: totalProducts[0]?.count || 0,
      },
      recentCollections,
      recentProducts,
    };
  }),

  // Get filter options for admin
  getFilterOptions: protectedProcedure.query(async ({ ctx }) => {
    // Get all categories for filtering
    const categories = await db.query.collectionsTable.findMany({
      where: isNull(collectionsTable.deletedAt),
      columns: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: [asc(collectionsTable.title)],
    });

    return {
      categories,
      statuses: ["active", "draft", "archived"],
      sortOptions: {
        collections: ["name-asc", "name-desc", "newest", "oldest"],
        products: ["name-asc", "name-desc", "newest", "oldest", "price-asc", "price-desc"],
      },
    };
  }),
});
