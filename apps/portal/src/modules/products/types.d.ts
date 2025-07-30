import type { InferSelectModel } from "drizzle-orm";

import { productSettingsTable, productsTable, productVariantsTable } from "@ziron/db/schema";

import { Seo } from "../collections/types";

export type Product = InferSelectModel<typeof productsTable>;
export type ProductVariants = InferSelectModel<typeof productVariantsTable>;
export type ProductSettings = InferSelectModel<typeof productSettingsTable>;

// Query result types
export type ProductQueryResult =
  | (Product & { variants?: ProductVariants[]; seo?: Seo | null; settings: ProductSettings })
  | undefined;

export type ProductUpsertType = InferInsertModel<typeof productsTable>;

// Enhanced product query options with role-based filtering
export type ProductQueryOptions = {
  // User context
  currentUserId?: string;
  currentUserRole?: "user" | "vendor" | "admin" | "dev";

  // Filtering options
  status?: "active" | "draft" | "archived";
  collectionId?: string;
  collectionSlug?: string;
  search?: string;
  condition?: string;
  brand?: string;
  featured?: boolean;

  // Pagination
  limit?: number;
  offset?: number;

  // Specific product lookup
  slug?: string;
};
