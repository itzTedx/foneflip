import { eq } from "drizzle-orm";

import { db } from "@ziron/db";
import { productsTable, seoTable } from "@ziron/db/schema";
import { slugify } from "@ziron/utils";

import { createLog } from "@/lib/utils";
import { Seo } from "@/modules/collections/types";

import { ProductUpsertType } from "../types";
import { existingProduct } from "./queries";

const log = createLog("Product");

// Types for slug operations
export interface SlugGenerationOptions {
  title: string;
  customSlug?: string;
  maxAttempts?: number;
}

export interface SlugValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Generates a unique slug by appending an incrementing counter to the base slug if needed.
 *
 * Attempts to find a unique slug by checking for existing products with the same slug, up to a maximum number of attempts.
 *
 * @param baseSlug - The initial slug to use as a base
 * @param maxAttempts - The maximum number of attempts to find a unique slug (default is 100)
 * @returns A unique slug string
 * @throws If a unique slug cannot be generated within the allowed number of attempts
 */
export async function generateUniqueSlug(baseSlug: string, maxAttempts = 100): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await existingProduct(slug)) {
    if (counter > maxAttempts) {
      throw new Error(`Unable to generate unique slug after ${maxAttempts} attempts`);
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Creates a slug from title or custom slug
 * @param options - Slug generation options
 * @returns Promise resolving to a unique slug
 */
export async function createProductSlug({
  title,
  customSlug,
  maxAttempts = 100,
}: SlugGenerationOptions): Promise<string> {
  const baseSlug = customSlug ?? slugify(title);
  return generateUniqueSlug(baseSlug, maxAttempts);
}

// Types for SEO operations
export interface SeoMetaData {
  title?: string;
  description?: string;
  keywords?: string;
}

export interface SeoUpsertResult {
  seoId: string;
  seoRow: Seo;
}

export type Trx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface SeoUpsertOptions {
  productId?: string;
  meta: SeoMetaData;
}

/**
 * Upserts SEO metadata for a Product
 * @param options - SEO upsert options including Product ID, meta data, and transaction
 * @returns Promise resolving to SEO upsert result with ID and row data
 */
export async function upsertSeoMeta(tx: Trx, { productId, meta }: SeoUpsertOptions): Promise<SeoUpsertResult> {
  let seoRow: Seo | undefined;

  if (productId) {
    // Try to find existing SEO row by Product id
    const existing = await tx.query.productsTable.findFirst({
      where: eq(productsTable.id, productId),
    });

    if (existing?.seoId) {
      // Update existing SEO row
      [seoRow] = await tx
        .update(seoTable)
        .set({
          metaTitle: meta.title || "",
          metaDescription: meta.description || "",
          keywords: meta.keywords || "",
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(seoTable.id, existing.seoId))
        .returning();
    }
  }

  if (!seoRow) {
    // Insert new SEO row
    [seoRow] = await tx
      .insert(seoTable)
      .values({
        metaTitle: meta.title || "",
        metaDescription: meta.description || "",
        keywords: meta.keywords || "",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }

  if (!seoRow) {
    throw new Error("Failed to upsert SEO meta");
  }

  return {
    seoId: seoRow.id,
    seoRow,
  };
}

interface UpsertProductDataProps {
  data: Partial<ProductUpsertType>;
  seoId?: string;
  deliveryId?: string | null;
  productId?: string;
}

export const upsertProductData = async (trx: Trx, { data, seoId, deliveryId, productId }: UpsertProductDataProps) => {
  const values = { ...data, seoId, deliveryId: deliveryId ?? null };
  if (productId) {
    const [product] = await trx.update(productsTable).set(values).where(eq(productsTable.id, productId)).returning();

    log.success("Product updated", product);

    return product;
  }
  const [product] = await trx.insert(productsTable).values(values).returning();

  log.success("Product created", product);

  return product;
};
