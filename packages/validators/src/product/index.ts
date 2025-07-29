import { z } from "zod/v4";

import { mediaSchema } from "../media";
import { metaSchema } from "../seo";
import { deliverySchema } from "./delivery";
import { productConditionEnum } from "./enum";
import { productSettingsSchema } from "./settings";
import { variantSchema } from "./variants";

export const productSchema = z
  .object({
    id: z.string().optional(),
    title: z.string("Product title is required.").min(1, { message: "Please enter a product title." }),
    description: z.string().optional(),
    slug: z.string("Slug must be a text value.").optional(),
    condition: productConditionEnum.default("pristine").optional(),
    brand: z.string("Please enter a valid brand.").optional(),
    collectionId: z.string("Please select a valid collection.").optional(),
    vendorId: z.string("Vendor ID must be a valid string").optional(),

    hasVariant: z.boolean().optional(),
    price: z.object({
      selling: z.string("Selling price must be a valid number.").optional(),
      original: z.string("Original price must be a valid number.").optional(),
    }),
    sku: z.string("SKU must be a valid text value.").optional(),
    stock: z.number("Stock quantity is required.").min(0, "Stock must be a positive number"),

    specifications: z
      .array(
        z
          .object({
            order: z.number().optional(),
            name: z.string().min(1, { message: "Specification title is required." }),
            value: z.string().min(1, { message: "Specification value is required." }),
          })
          .optional()
      )
      .optional(),

    delivery: deliverySchema,

    attributes: z
      .array(
        z.object({
          name: z.string("Please enter an attribute name..").min(1, { message: "Attribute name is required." }),
          options: z
            .array(z.string("Option must be a valid text."))
            .min(1, { message: "Each attribute must have at least one option." }),
        })
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
      if (data.hasVariant === false) {
        return !!data.price.selling && data.price.selling.trim() !== "";
      }
      return true;
    },
    {
      message: "Selling price is required when the product has no variants.",
      path: ["price", "selling"],
    }
  )
  .refine(
    (data) => {
      // If variants exist, there must be valid attributes
      if (data.variants && data.variants.length > 0) {
        return (
          data.attributes &&
          data.attributes.length > 0 &&
          data.attributes.some((attr) => attr.name && attr.options.length > 0)
        );
      }
      return true;
    },
    {
      message: "To add product variants, please define at least one attribute with options.",
      path: ["variants"],
    }
  );

export type ProductFormType = z.infer<typeof productSchema>;

export * from "./draft";
export * from "./enum";
export * from "./settings";
export * from "./variants";
