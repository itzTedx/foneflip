import { z } from "zod/v4";

export const collectionStatusEnum = z.enum(["active", "archived", "draft"], {
  message: "Invalid status",
});

export const collectionsSettingsSchema = z.object({
  status: collectionStatusEnum.default("draft").optional(),
  isFeatured: z
    .boolean({ message: "Featured must be true or false" })
    .default(false)
    .optional(),
  layout: z.string({ message: "Invalid layout" }).default("grid").optional(),
  showLabel: z
    .boolean({ message: "showLabel must be true or false" })
    .default(true)
    .optional(),
  showBanner: z
    .boolean({ message: "showBanner must be true or false" })
    .default(false)
    .optional(),
  showInNav: z
    .boolean({ message: "showInNav must be true or false" })
    .default(true)
    .optional(),
  tags: z
    .array(z.string({ message: "Each tag must be a string" }), {
      message: "Tags must be an array",
    })
    .optional()
    .optional(),
  internalNotes: z
    .string({ message: "internalNotes must be a string" })
    .max(1000, { message: "internalNotes is too long" })
    .optional(),

  customCTA: z
    .string({ message: "customCTA must be a string" })
    .max(40, { message: "customCTA is too long" })
    .optional(),
});
