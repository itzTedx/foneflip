import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth-schema";
import { baseSchema } from "./base-schema";
import { collectionMediaTable } from "./collection-schema";
import { productImagesTable } from "./product-schema";

export const mediaTable = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull(),
    alt: text("alt"),
    fileName: text("file_name"),
    width: integer("width"),
    height: integer("height"),
    fileSize: integer("file_size"),
    blurData: text("blur_data"),
    key: text("key"),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...baseSchema,
  },
  (table) => [index("media_url_idx").on(table.url)]
);

export const mediaRelations = relations(mediaTable, ({ many, one }) => ({
  collections: many(collectionMediaTable),
  user: one(users, {
    fields: [mediaTable.userId],
    references: [users.id],
  }),
}));

export const mediaProductImagesRelations = relations(
  mediaTable,
  ({ many }) => ({
    productImages: many(productImagesTable),
  })
);
