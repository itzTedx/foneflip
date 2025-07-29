import { z } from "zod/v4";

// Base schema for a variant, used in both product and draft schemas
export const variantSchema = z.object({
  sku: z.string().optional(),
  price: z.object({
    selling: z.string().optional(),
    original: z.string().optional(),
  }),
  stock: z.number().optional(),
  isDefault: z.boolean().optional(),
  attributes: z.array(
    z.object({
      name: z.string().optional(),
      value: z.string().optional(),
    })
  ),
});
