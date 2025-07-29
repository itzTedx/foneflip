import { z } from "zod/v4";

import { mediaSchema } from "../media";
import type { collectionDraftSchema } from "./draft";
import { collectionsSettingsSchema } from "./settings";

export const collectionMediaTypeEnum = z.enum(["thumbnail", "banner"]);

export const collectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required and cannot be empty" }),
  description: z.string().optional(),
  label: z.string().optional(),
  sortOrder: z.number().optional(),

  slug: z.string().optional(),

  thumbnail: mediaSchema.optional(),
  banner: mediaSchema.optional(),

  meta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
  }),

  settings: collectionsSettingsSchema,
});

export * from "./draft";
export * from "./settings";

export type CollectionDraftFormType = z.infer<typeof collectionDraftSchema>;
export type CollectionFormType = z.infer<typeof collectionSchema>;
