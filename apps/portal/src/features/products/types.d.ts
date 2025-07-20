import type { InferSelectModel } from "drizzle-orm";

import { productsTable, productVariantsTable } from "@ziron/db/schema";

export type Product = InferSelectModel<typeof productsTable>;
export type ProductVariants = InferSelectModel<typeof productVariantsTable>;

// Query result types
export type ProductQueryResult =
  | (Product & { variants?: ProductVariants[] })
  | undefined;
