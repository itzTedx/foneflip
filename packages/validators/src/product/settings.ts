import { z } from "zod/v4";

import { productStatusEnum } from "./enum";

export const productSettingsSchema = z
  .object({
    productId: z.string().optional(),
    // 🔹 1. Product Visibility & Status
    status: productStatusEnum.default("draft").optional(),
    visible: z.boolean("Please specify whether the product should be visible."),

    // 🔹 2. Customer Interactions
    allowReviews: z.boolean("Please specify if customers can leave reviews."),
    allowBackorders: z.boolean("Please indicate whether backorders are allowed."),
    showStockStatus: z.boolean("Please choose whether to show stock availability to customers."),

    // 🔹 3. Tagging & Metadata
    tags: z.array(z.string("Each tag must be a text value.")).optional(),
    internalNotes: z
      .string("Internal notes must be text.")
      .max(1000, "Notes must not exceed 1000 characters.")
      .optional(),

    // 🔹 4. Custom Display Settings
    featured: z.boolean(),
    hidePrice: z.boolean(),
    customCTA: z
      .string("Custom CTA must be text.")
      .max(40, "Custom call-to-action must be 40 characters or fewer.")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.hidePrice) {
        return !!data.customCTA && data.customCTA.trim() !== "";
      }
      return true;
    },
    {
      message: "Custom CTA is required when the price is hidden.",
      path: ["customCTA"],
    }
  );
