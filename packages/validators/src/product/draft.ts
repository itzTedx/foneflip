import { z } from "zod/v4";

import { mediaSchema } from "../media";
import { productConditionEnum } from "./enum";
import { productSettingsSchema } from "./settings";
import { variantSchema } from "./variants";

// Schema for saving as draft (more lenient validation)
export const productDraftSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    slug: z.string().optional(),
    condition: productConditionEnum.default("pristine").optional(),
    brand: z.string().optional(),
    collectionId: z.string().optional(),
    vendorId: z.string().optional(),

    hasVariant: z.boolean().optional(),
    price: z
      .object({
        selling: z.string().optional(),
        original: z.string().optional(),
      })
      .partial(),
    sku: z.string().optional(),
    stock: z.number().optional(),

    specifications: z
      .array(
        z.object({
          order: z.number().optional(),
          name: z.string().optional(),
          value: z.string().optional(),
        }),
      )
      .optional(),

    delivery: z
      .object({
        packageSize: z.string().optional(),
        weight: z.string().optional(),
        cod: z.boolean().optional(),
        returnable: z.boolean().optional(),
        returnPeriod: z.number().optional(),
        type: z
          .object({
            express: z.boolean().optional(),
            fees: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    attributes: z
      .array(
        z.object({
          name: z.string().optional(),
          options: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    variants: z.array(variantSchema.partial()).optional(),

    meta: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.string().optional(),
    }),
    images: z.array(mediaSchema).optional(),

    settings: productSettingsSchema.optional(),

    customFields: z.record(z.any(), z.string()).optional(),
  })
  .partial()
  .refine(
    (data) => {
      // If variants exist, there must be valid attributes
      if (data.variants && data.variants.length > 0) {
        return (
          data.attributes &&
          data.attributes.length > 0 &&
          data.attributes.some(
            (attr) => attr.name && attr.options && attr.options.length > 0,
          )
        );
      }
      return true;
    },
    {
      message: "Variants can only be added when attributes are defined",
      path: ["variants"],
    },
  );

export type ProductDraftFormType = z.infer<typeof productDraftSchema>;
