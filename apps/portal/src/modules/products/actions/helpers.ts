import { eq, inArray } from "drizzle-orm";

import {
  collectionsTable,
  mediaTable,
  productAttributeOptionsTable,
  productAttributesTable,
  productDeliveriesTable,
  productImagesTable,
  productSettingsTable,
  productSpecificationsTable,
  productsTable,
  productVariantOptionsTable,
  productVariantsTable,
  seoTable,
} from "@ziron/db/schema";
import { db } from "@ziron/db/server";
import { slugify } from "@ziron/utils";
import { ProductDraftFormType, ProductFormType } from "@ziron/validators";

import { createLog } from "@/lib/utils";
import { Seo } from "@/modules/collections/types";
import { InsertMedia } from "@/modules/media/types";

import { ProductUpsertType, UpsertProductDeliveries } from "../types";
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

/**
 * Resolves collection ID from slug if needed
 */
export const resolveCollectionId = async (collectionId?: string, collectionSlug?: string) => {
  if (collectionId) return collectionId;

  if (collectionSlug) {
    const collection = await db.query.collectionsTable.findFirst({
      where: eq(collectionsTable.slug, collectionSlug),
      columns: { id: true },
    });
    return collection?.id;
  }

  return null;
};

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
  // Convert empty strings to null for UUID fields
  const sanitizedData = {
    ...data,
    collectionId: data.collectionId === "" ? null : data.collectionId,
    vendorId: data.vendorId === "" ? null : data.vendorId,
  };

  const values = { ...sanitizedData, seoId, deliveryId: deliveryId ?? null };
  log.success("Values Received for upsertProductData", sanitizedData);
  if (productId) {
    log.success("Product Id to update", productId);
    const [product] = await trx.update(productsTable).set(values).where(eq(productsTable.id, productId)).returning();

    log.success("Product updated", product);

    return product;
  }
  // Ensure required fields are present and filter out undefined values
  const insertValues = {
    title: values.title || "",
    slug: values.slug || "",
    condition: values.condition || "pristine",
    ...Object.fromEntries(
      Object.entries(values).filter(
        ([key, value]) => value !== undefined && key !== "title" && key !== "slug" && key !== "condition"
      )
    ),
  };
  const [product] = await trx.insert(productsTable).values(insertValues).returning();

  log.success("Product created", product);

  return product;
};

interface UpsertProductSettingsProps {
  productId: string;
  settings: ProductFormType["settings"] | ProductDraftFormType["settings"];
}

export const upsertSettings = async (trx: Trx, { productId, settings }: UpsertProductSettingsProps) => {
  if (!settings) return;

  log.info("Handling product settings", { productId, settings });
  await trx
    .insert(productSettingsTable)
    .values({
      productId,
      status: settings.status,
      visible: settings.visible,
      allowReviews: settings.allowReviews,
      allowBackorders: settings.allowBackorders,
      showStockStatus: settings.showStockStatus,
      tags: settings.tags,
      internalNotes: settings.internalNotes,
      featured: settings.featured,
      hidePrice: settings.hidePrice,
      customCTA: settings.customCTA,
    })
    .onConflictDoUpdate({
      target: productSettingsTable.productId,
      set: {
        status: settings.status,
        visible: settings.visible,
        allowReviews: settings.allowReviews,
        allowBackorders: settings.allowBackorders,
        showStockStatus: settings.showStockStatus,
        tags: settings.tags,
        internalNotes: settings.internalNotes,
        featured: settings.featured,
        hidePrice: settings.hidePrice,
        customCTA: settings.customCTA,
      },
    });
  log.success("Inserted/Updated product settings");
};

interface UpsertSpecificationsProps {
  productId: string;
  specifications: ProductFormType["specifications"] | ProductDraftFormType["specifications"];
}

export const upsertSpecifications = async (trx: Trx, { productId, specifications }: UpsertSpecificationsProps) => {
  await trx.delete(productSpecificationsTable).where(eq(productSpecificationsTable.productId, productId));

  if (!specifications || !Array.isArray(specifications) || specifications.length === 0) {
    log.info("No specifications to insert for product", { productId });
    return;
  }

  log.info("Handling product specifications", { count: specifications.length });
  const specsToInsert = specifications.reduce<{ productId: string; name: string; value: string }[]>((acc, spec) => {
    if (spec?.name && spec.value) {
      acc.push({ productId, name: spec.name, value: spec.value });
    }
    return acc;
  }, []);

  if (specsToInsert.length > 0) {
    await trx.insert(productSpecificationsTable).values(specsToInsert);
    log.success("Inserted/Updated product specifications", {
      count: specsToInsert.length,
    });
  }
};

interface UpsertDeliveryProps {
  product: { id: string; deliveryId?: string | null };
  delivery: ProductFormType["delivery"] | ProductDraftFormType["delivery"];
}

export const upsertDelivery = async (trx: Trx, { product, delivery }: UpsertDeliveryProps) => {
  if (!delivery) return null;

  log.info("Handling product delivery details", { delivery });
  const deliveryData: UpsertProductDeliveries = {
    weight: delivery.weight ?? "",
    packageSize: delivery.packageSize ?? "",
    cod: delivery.cod ?? false,
    returnable: delivery.returnable ?? false,
    returnPeriod: delivery.returnPeriod
      ? (() => {
          const parsed = Number.parseInt(delivery.returnPeriod.toString(), 10);
          return Number.isNaN(parsed) ? null : parsed;
        })()
      : null,
    expressDelivery: delivery.type?.express ?? false,
    deliveryFees: delivery.type?.fees ?? "free",
  };

  let deliveryId = product.deliveryId;

  if (deliveryId) {
    await trx.update(productDeliveriesTable).set(deliveryData).where(eq(productDeliveriesTable.id, deliveryId));

    log.success("Updated product delivery details", { deliveryId });
  } else {
    const [newDelivery] = await trx
      .insert(productDeliveriesTable)
      .values(deliveryData)
      .returning({ id: productDeliveriesTable.id });

    deliveryId = newDelivery?.id;

    await trx.update(productsTable).set({ deliveryId }).where(eq(productsTable.id, product.id));

    log.success("Created new product delivery details", { deliveryId });
  }
  return deliveryId;
};

interface UpsertAttributesAndVariantsProps {
  productId: string;
  hasVariant: ProductFormType["hasVariant"];
  attributes: ProductFormType["attributes"] | ProductDraftFormType["attributes"];
  variants: ProductFormType["variants"] | ProductDraftFormType["variants"];
}

export const upsertAttributesAndVariants = async (
  trx: Trx,
  { productId, hasVariant, attributes, variants }: UpsertAttributesAndVariantsProps
) => {
  await trx.delete(productAttributesTable).where(eq(productAttributesTable.productId, productId));
  await trx.delete(productVariantsTable).where(eq(productVariantsTable.productId, productId));

  if (!hasVariant) {
    log.info("Product has no variants, cleaning up existing data.");
    return;
  }

  log.info("Handling product attributes and variants", { productId });
  const createdOptionsMap = new Map<string, string>();

  if (attributes && Array.isArray(attributes)) {
    for (const attr of attributes) {
      if (!attr?.name || !attr.options?.length) continue;

      const [newAttribute] = await trx
        .insert(productAttributesTable)
        .values({ productId: productId, name: attr.name })
        .returning({ id: productAttributesTable.id });

      if (!newAttribute) continue;

      const optionsToInsert = attr.options
        .filter((o): o is string => !!o)
        .map((value) => ({
          attributeId: newAttribute.id,
          value,
        }));

      if (optionsToInsert.length > 0) {
        const insertedOptions = await trx.insert(productAttributeOptionsTable).values(optionsToInsert).returning();

        insertedOptions.forEach((opt) => {
          if (attr.name && opt.value) {
            createdOptionsMap.set(`${attr.name}:${opt.value}`, opt.id);
          }
        });
      }
    }
    log.success("Created product attributes and options");
  }

  if (variants && Array.isArray(variants)) {
    for (const variant of variants) {
      if (!variant?.price) continue;

      const [newVariant] = await trx
        .insert(productVariantsTable)
        .values({
          productId: productId,
          sku: variant.sku,
          stock: variant.stock,
          sellingPrice: String(variant.price.selling || "0"),
          originalPrice: variant.price.original ? String(variant.price.original) : null,
          isDefault: variant.isDefault ?? false,
        })
        .returning({ id: productVariantsTable.id });

      if (!newVariant) continue;

      if (variant.attributes && Array.isArray(variant.attributes)) {
        const variantOptionsToInsert = variant.attributes
          .map((opt) => {
            if (!opt?.name || !opt?.value) return null;
            const optionId = createdOptionsMap.get(`${opt.name}:${opt.value}`);
            if (!optionId) {
              log.error(`Could not find option for ${opt.name}:${opt.value}`);
              return null;
            }
            return {
              variantId: newVariant.id,
              optionId,
            };
          })
          .filter((v): v is NonNullable<typeof v> => v !== null);

        if (variantOptionsToInsert.length > 0) {
          await trx.insert(productVariantOptionsTable).values(variantOptionsToInsert);
        }
      }
    }
    log.success("Created product variants and linked options");
  }
};

interface UpsertImagesProps {
  productId: string;
  images: ProductFormType["images"] | ProductDraftFormType["images"];
  userId: string;
}

export const upsertImages = async (trx: Trx, { images, userId, productId }: UpsertImagesProps) => {
  await trx.delete(productImagesTable).where(eq(productImagesTable.productId, productId));

  if (!images || images.length === 0) {
    log.info("No images to process for product", { productId });
    return;
  }

  log.info("Processing images", { count: images.length });

  // Assume images is always an array of objects with the correct shape
  const urls = images.map((img) => img?.file?.url).filter((url): url is string => !!url);
  const existingMedia = await trx.select().from(mediaTable).where(inArray(mediaTable.url, urls));

  const existingUrls = new Set(existingMedia.map((m) => m.url));
  const newMediaToInsert = images.filter((img) => img.file?.url && !existingUrls.has(img.file.url));

  let insertedMedia: InsertMedia[] = [];
  if (newMediaToInsert.length > 0) {
    insertedMedia = await trx
      .insert(mediaTable)
      .values(
        newMediaToInsert.map((image) => ({
          url: image.file?.url!,
          fileName: image.file?.name ?? "",
          fileSize: image.file?.size ?? 0,
          width: image.metadata?.width ?? 0,
          height: image.metadata?.height ?? 0,
          alt: image.alt ?? null,
          blurData: image.metadata?.blurData ?? "",
          userId,
        }))
      )
      .returning();
    log.success("Inserted new media", { count: insertedMedia.length });
  }

  const allMediaForProduct = [...existingMedia, ...insertedMedia];
  // Find the index of the featured image, or default to the first image
  let featuredIdx = images.findIndex((img) => img.isPrimary);
  if (featuredIdx === -1 && images.length > 0) featuredIdx = 0;

  const productImagesValues = images
    .map((img, idx) => {
      const media = allMediaForProduct.find((m) => m.url === img.file?.url);
      return media
        ? {
            productId: productId,
            mediaId: media.id,
            sortOrder: idx,
            isFeatured: idx === featuredIdx,
          }
        : undefined;
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  if (productImagesValues.length > 0) {
    await trx.insert(productImagesTable).values(productImagesValues);
    log.success("Inserted product images", {
      count: productImagesValues.length,
    });
  }
};
