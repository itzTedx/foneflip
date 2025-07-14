import { z } from "zod/v4";

export const collectionStatusEnum = z.enum(["active", "archived", "draft"]);

export const collectionsSettingsSchema = z.object({
  status: collectionStatusEnum.default("draft").optional(),
  isFeatured: z.boolean().default(false).optional(),
  layout: z.string().default("grid").optional(),
  showLabel: z.boolean().default(true).optional(),
  showBanner: z.boolean().default(false).optional(),
  showInNav: z.boolean().default(true).optional(),
  tags: z.array(z.string()).optional(),
  internalNotes: z.string().max(1000).optional(),
  customCTA: z.string().max(40).optional(),
});
