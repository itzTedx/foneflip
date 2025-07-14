import { z } from "zod/v4";

import { mediaSchema } from "../media";
import { collectionsSettingsSchema } from "./settings";

export const collectionDraftSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  slug: z.string().optional(),
  thumbnail: mediaSchema.optional(),
  banner: mediaSchema.optional(),
  meta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.string().optional(),
    })
    .optional(),
  settings: collectionsSettingsSchema.optional(),
});
