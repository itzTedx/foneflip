import { boolean, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { baseSchema } from "./base-schema";

export const storefrontSettingsTable = pgTable("storefront_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  hasAnnouncement: boolean("has_announcement").default(false),
  announcementText: text("announcement_text"),
  announcementKey: varchar("announcement_key"),
  ...baseSchema,
});
