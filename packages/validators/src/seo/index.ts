import { z } from "zod/v4";

// Base schema for a variant, used in both product and draft schemas
export const metaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
});
