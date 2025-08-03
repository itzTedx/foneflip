import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  productAttributeOptionsTable,
  productAttributesTable,
  productDeliveriesTable,
  productImagesTable,
  productSettingsTable,
  productSpecificationsTable,
  productsTable,
  productVariantOptionsTable,
  productVariantsTable,
} from "@ziron/db/schema";
import { Vendor } from "@ziron/db/types";

import { Collection, Media, Seo } from "../collections/types";

export type UpsertProductDeliveries = InferInsertModel<typeof productDeliveriesTable>;
export type Product = InferSelectModel<typeof productsTable>;
export type ProductVariant = InferSelectModel<typeof productVariantsTable>;
export type ProductVariantsOption = InferSelectModel<typeof productVariantOptionsTable>;
export type ProductAttribute = InferSelectModel<typeof productAttributesTable>;
export type ProductAttributeOption = InferSelectModel<typeof productAttributeOptionsTable>;
export type ProductSetting = InferSelectModel<typeof productSettingsTable>;
export type ProductDelivery = InferSelectModel<typeof productDeliveriesTable>;
export type ProductSpecification = InferSelectModel<typeof productSpecificationsTable>;
export type ProductImage = InferSelectModel<typeof productImagesTable>;

// Query result types
export type ProductQueryResult = Product & {
  seo?: Seo | null;
  settings: ProductSetting;
  attributes?: (ProductAttribute & { options: ProductAttributeOption[] })[];
  specifications?: ProductSpecification[];
  variants?: (ProductVariant & {
    options: (ProductVariantsOption & { option: ProductAttributeOption & { attribute: ProductAttribute } })[];
  })[];
  collection?: Collection | null;
  delivery?: ProductDelivery | null;
  images?: (ProductImage & { media: Media })[];
  vendor?: Vendor | null;
};

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
