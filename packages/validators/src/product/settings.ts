import { z } from "zod/v4";

import { productStatusEnum } from "./enum";

export const productSettingsSchema = z.object({
  productId: z.string().optional(),
  // 🔹 1. Product Visibility & Status
  status: productStatusEnum.default("draft").optional(),
  visible: z.boolean(),

  // 🔹 2. Customer Interactions
  allowReviews: z.boolean(),
  allowBackorders: z.boolean(),
  showStockStatus: z.boolean(),

  // 🔹 3. Tagging & Metadata
  tags: z.array(z.string()).optional(),
  internalNotes: z.string().max(1000).optional(),

  // 🔹 4. Custom Display Settings
  featured: z.boolean(),
  hidePrice: z.boolean(),
  customCTA: z.string().max(40).optional(),
});
