import { z } from "zod/v4";

import { mediaSchema } from "../media";
import { metaSchema } from "../seo";
import { productConditionEnum } from "./enum";
import { productSettingsSchema } from "./settings";
import { variantSchema } from "./variants";

export const productSchema = z
  .object({
    id: z.string().optional(),
    title: z.string("Please enter valid title").min(1, {message: "Title is Required"}),
    description: z.string().optional(),
    slug: z.string().min(1).optional(),
    condition: productConditionEnum.default("pristine").optional(),
    brand: z.string().optional(),
    collectionId: z.string().optional(),
    vendorId: z.string().optional(),

    hasVariant: z.boolean().optional(),
    price: z.object({
      selling: z.string().optional(),
      original: z.string().optional(),
    }),
    sku: z.string().optional(),
    stock: z.number().min(0, "Stock must be a positive number"),

    specifications: z
      .array(
        z.object({
          order: z.number().optional(),
          name: z
            .string()
            .min(1, { message: "Please enter title for the link" }),
          value: z.string().min(1, { message: "Please enter a valid." }),
        }).optional(),
      )
      .optional(),

    delivery: z
      .object({
        packageSize: z.string().optional(),
        weight: z.string().optional(),
        cod: z.boolean().optional(),
        returnable: z.boolean().optional(),
        returnPeriod: z.string().optional(),
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
          name: z.string(),
          options: z.array(z.string()),
        }),
      )
      .optional(),
    variants: z.array(variantSchema).optional(),

    meta: metaSchema,
    images: z.array(mediaSchema).optional(),

    settings: productSettingsSchema,

    customFields: z.record(z.any(), z.any()).optional(),
  })
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

export type ProductFormType = z.infer<typeof productSchema>;

export * from "./draft";
export * from "./enum";
export * from "./settings";
export * from "./variants";

