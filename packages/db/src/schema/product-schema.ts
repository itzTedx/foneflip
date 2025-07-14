import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users as user } from "./auth-schema";
import { baseSchema } from "./base-schema";
import { collectionsTable } from "./collection-schema";
import { mediaTable } from "./media-schema";
import { seoTable } from "./seo-schema";
import { vendorsTable } from "./vendor-schema";

export const productConditionEnum = pgEnum("product_condition", [
  "pristine",
  "excellent",
  "good",
  "new",
]);

export const productStatusEnum = pgEnum("product_status", [
  "active",
  "archived",
  "draft",
]);

export const productsTable = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    collectionId: uuid("collection_id").references(() => collectionsTable.id, {
      onDelete: "set null",
    }),
    brand: text("brand"),
    condition: productConditionEnum("condition").notNull(),
    hasVariant: boolean("has_variant").default(false),
    sellingPrice: text("selling_price"),
    originalPrice: text("original_price"),
    sku: text("sku"),
    stock: smallint("stock"),
    seoId: uuid("seo_id").references(() => seoTable.id, {
      onDelete: "set null",
    }),
    deliveryId: uuid("delivery_id").references(
      () => productDeliveriesTable.id,
      {
        onDelete: "set null",
      },
    ),
    userId: uuid("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    vendorId: uuid("vendor_id").references(() => vendorsTable.id, {
      onDelete: "set null",
    }),
    ...baseSchema,
  },
  (table) => ({
    slugIdx: index("products_slug_idx").on(table.slug),
    collectionIdIdx: index("products_collection_id_idx").on(table.collectionId),
    brandIdx: index("products_brand_idx").on(table.brand),
    conditionIdx: index("products_condition_idx").on(table.condition),
    userIdIdx: index("products_user_id_idx").on(table.userId),
    vendorIdIdx: index("products_vendor_id_idx").on(table.vendorId),
  }),
);

export const productVariantsTable = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  sku: text("sku").unique(),
  stock: integer("stock").default(0),
  sellingPrice: numeric("selling_price").notNull(),
  originalPrice: numeric("original_price"),
  isDefault: boolean("is_default").default(false),
});

export const productAttributesTable = pgTable("product_attributes", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const productAttributeOptionsTable = pgTable(
  "product_attribute_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => productAttributesTable.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
  },
  (table) => ({
    attributeIdIdx: index("attribute_options_attribute_id_idx").on(
      table.attributeId,
    ),
  }),
);

export const productVariantOptionsTable = pgTable(
  "product_variant_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariantsTable.id, { onDelete: "cascade" }),
    optionId: uuid("option_id")
      .notNull()
      .references(() => productAttributeOptionsTable.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    variantIdIdx: index("variant_options_variant_id_idx").on(table.variantId),
    optionIdIdx: index("variant_options_option_id_idx").on(table.optionId),
  }),
);

export const productImagesTable = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id")
    .notNull()
    .references(() => mediaTable.id, { onDelete: "cascade" }),
  isFeatured: boolean("is_featured").default(false),
  sortOrder: integer("sort_order").default(0),
});

export const productSpecificationsTable = pgTable(
  "product_specifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").references(() => productsTable.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    value: text("value").notNull(),
  },
  (table) => ({
    productIdIdx: index("product_specifications_product_id_idx").on(
      table.productId,
    ),
  }),
);

export const productDeliveriesTable = pgTable("product_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  weight: numeric("weight"),
  packageSize: text("package_size"),
  cod: boolean("cod").default(false),
  returnable: boolean("returnable").default(false),
  returnPeriod: integer("returnable_period"),
  expressDelivery: boolean("express_delivery").default(false),
  deliveryFees: varchar("delivery_fees").default("free"),
});

export const productSettingsTable = pgTable(
  "product_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .unique()
      .references(() => productsTable.id, {
        onDelete: "cascade",
      }),
    status: productStatusEnum("status").default("draft"),
    visible: boolean("visible").notNull().default(true),
    allowReviews: boolean("allow_reviews").notNull().default(true),
    allowBackorders: boolean("allow_backorders").notNull().default(false),
    showStockStatus: boolean("show_stock_status").notNull().default(true),
    tags: text("tags").array(),
    internalNotes: text("internal_notes"),
    featured: boolean("featured").notNull().default(false),
    hidePrice: boolean("hide_price").notNull().default(false),
    customCTA: varchar("custom_cta"),
    ...baseSchema,
  },
  (table) => ({
    productIdIdx: index("product_settings_product_id_idx").on(table.productId),
  }),
);

export const productReviewsTable = pgTable("product_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  collection: one(collectionsTable, {
    fields: [productsTable.collectionId],
    references: [collectionsTable.id],
  }),
  seo: one(seoTable, {
    fields: [productsTable.seoId],
    references: [seoTable.id],
  }),
  variants: many(productVariantsTable),
  attributes: many(productAttributesTable),
  images: many(productImagesTable),
  reviews: many(productReviewsTable),
  specifications: many(productSpecificationsTable),
  delivery: one(productDeliveriesTable, {
    fields: [productsTable.deliveryId],
    references: [productDeliveriesTable.id],
  }),
  settings: one(productSettingsTable, {
    fields: [productsTable.id],
    references: [productSettingsTable.productId],
  }),
  user: one(user, {
    fields: [productsTable.userId],
    references: [user.id],
  }),
  vendor: one(vendorsTable, {
    fields: [productsTable.vendorId],
    references: [vendorsTable.id],
  }),
}));

export const productVariantsRelations = relations(
  productVariantsTable,
  ({ one, many }) => ({
    product: one(productsTable, {
      fields: [productVariantsTable.productId],
      references: [productsTable.id],
    }),
    options: many(productVariantOptionsTable),
  }),
);

export const productAttributesRelations = relations(
  productAttributesTable,
  ({ one, many }) => ({
    product: one(productsTable, {
      fields: [productAttributesTable.productId],
      references: [productsTable.id],
    }),
    options: many(productAttributeOptionsTable),
  }),
);

export const productAttributeOptionsRelations = relations(
  productAttributeOptionsTable,
  ({ one, many }) => ({
    attribute: one(productAttributesTable, {
      fields: [productAttributeOptionsTable.attributeId],
      references: [productAttributesTable.id],
    }),
    variantOptions: many(productVariantOptionsTable),
  }),
);

export const productVariantOptionsRelations = relations(
  productVariantOptionsTable,
  ({ one }) => ({
    variant: one(productVariantsTable, {
      fields: [productVariantOptionsTable.variantId],
      references: [productVariantsTable.id],
    }),
    option: one(productAttributeOptionsTable, {
      fields: [productVariantOptionsTable.optionId],
      references: [productAttributeOptionsTable.id],
    }),
  }),
);

export const productImagesRelations = relations(
  productImagesTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productImagesTable.productId],
      references: [productsTable.id],
    }),
    media: one(mediaTable, {
      fields: [productImagesTable.mediaId],
      references: [mediaTable.id],
    }),
  }),
);

export const productReviewsRelations = relations(
  productReviewsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productReviewsTable.productId],
      references: [productsTable.id],
    }),
  }),
);

export const productSpecificationsRelations = relations(
  productSpecificationsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productSpecificationsTable.productId],
      references: [productsTable.id],
    }),
  }),
);

export const productSettingsRelations = relations(
  productSettingsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productSettingsTable.productId],
      references: [productsTable.id],
    }),
  }),
);
