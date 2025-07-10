import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),

  message: text("message").notNull(),
  type: text("type").notNull(), // e.g., 'info', 'warning', 'alert', etc.
  read: boolean("read").default(false),

  metadata: jsonb("metadata"), // for extensibility (links, payloads, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // for soft deletes
});
