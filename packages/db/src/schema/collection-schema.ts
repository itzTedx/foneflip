import { relations } from "drizzle-orm";
import { boolean, index, integer, pgEnum, pgTable, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { baseSchema } from "./base-schema";
import { mediaTable } from "./media-schema";
import { productsTable } from "./product-schema";
import { seoTable } from "./seo-schema";

export const collectionStatusEnum = pgEnum("collection_status", ["active", "archived", "draft"]);

export const collectionsTable = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("name").notNull(),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    label: varchar("label"),
    sortOrder: integer("sort_order").default(0),
    seoId: uuid("seo_id").references(() => seoTable.id, {
      onDelete: "set null",
    }),
    ...baseSchema,
  },
  (table) => [
    uniqueIndex("collections_slug_idx").on(table.slug),
    index("collections_seo_id_idx").on(table.seoId),
    index("collections_deleted_at_idx").on(table.deletedAt),
  ]
);

export const collectionMediaTable = pgTable(
  "collection_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collectionsTable.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => mediaTable.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    ...baseSchema,
  },
  (table) => [
    index("collection_media_collection_id_idx").on(table.collectionId),
    index("collection_media_media_id_idx").on(table.mediaId),
    index("collection_media_type_idx").on(table.type),
  ]
);

export const collectionSettingsTable = pgTable(
  "collection_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .unique()
      .references(() => collectionsTable.id, {
        onDelete: "cascade",
      }),
    status: collectionStatusEnum("status").default("draft").notNull(),
    isFeatured: boolean("featured").default(false).notNull(),
    layout: varchar("layout").default("grid").notNull(),
    showLabel: boolean("show_label").default(true).notNull(),
    showBanner: boolean("show_banner").default(false).notNull(),
    showInNav: boolean("show_in_nav").default(true).notNull(),
    tags: text("tags").array().default([]).notNull(),
    internalNotes: text("internal_notes").default("").notNull(),
    customCTA: varchar("custom_cta").default("").notNull(),
    ...baseSchema,
  },
  (table) => [index("collection_settings_collection_id_idx").on(table.collectionId)]
);

export const collectionsRelations = relations(collectionsTable, ({ one, many }) => ({
  seo: one(seoTable, {
    fields: [collectionsTable.seoId],
    references: [seoTable.id],
  }),
  collectionMedia: many(collectionMediaTable),
  products: many(productsTable),
  settings: one(collectionSettingsTable, {
    fields: [collectionsTable.id],
    references: [collectionSettingsTable.collectionId],
  }),
}));

export const collectionMediaRelations = relations(collectionMediaTable, ({ one }) => ({
  collection: one(collectionsTable, {
    fields: [collectionMediaTable.collectionId],
    references: [collectionsTable.id],
  }),
  media: one(mediaTable, {
    fields: [collectionMediaTable.mediaId],
    references: [mediaTable.id],
  }),
}));

export const collectionSettingsRelations = relations(collectionSettingsTable, ({ one }) => ({
  product: one(collectionsTable, {
    fields: [collectionSettingsTable.collectionId],
    references: [collectionsTable.id],
  }),
}));
