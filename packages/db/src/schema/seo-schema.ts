import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { baseSchema } from "./base-schema";
import { collectionsTable } from "./collection-schema";
import { productsTable } from "./product-schema";

export const seoTable = pgTable("seo_meta", {
  id: uuid("id").primaryKey().defaultRandom(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: text("keywords"),
  ...baseSchema,
});

export const seoRelations = relations(seoTable, ({ many }) => ({
  collections: many(collectionsTable),
}));

export const seoProductsRelations = relations(seoTable, ({ many }) => ({
  products: many(productsTable),
}));
