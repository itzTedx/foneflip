import type { InferSelectModel } from "drizzle-orm";

import {
  productAttributesTable,
  productDeliveriesTable,
  productImagesTable,
  productSettingsTable,
  productSpecificationsTable,
  productsTable,
  productVariantsTable,
} from "@ziron/db/schema";

import { Collection, Seo } from "../collections/types";

export type UpsertProductDeliveries = InferInsertModel<typeof productDeliveriesTable>;

export type Product = InferSelectModel<typeof productsTable>;
export type ProductVariants = InferSelectModel<typeof productVariantsTable>;
export type ProductAttributes = InferSelectModel<typeof productAttributesTable>;
export type ProductSettings = InferSelectModel<typeof productSettingsTable>;
export type ProductDeliveries = InferSelectModel<typeof productDeliveriesTable>;
export type ProductSpecification = InferSelectModel<typeof productSpecificationsTable>;
export type ProductImage = InferSelectModel<typeof productImagesTable>;

// Query result types
export type ProductQueryResult =
  | (Product & {
      seo?: Seo | null;
      settings: ProductSettings;
      attributes?: ProductAttributes;
      specifications?: ProductSpecification[];
      variants?: ProductVariants[];
      collection?: Collection;
      delivery?: ProductDeliveries;
      images?: ProductImage[];
    })
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
