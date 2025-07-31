"use server";

import { db } from "@ziron/db";
import { slugify } from "@ziron/utils";
import { productSchema, z } from "@ziron/validators";

import { createLog } from "@/lib/utils";
import { requireUser } from "@/modules/auth/actions/data-access";

import { ProductUpsertType } from "../types";
import { revalidateProductCaches } from "./cache";
import {
  createProductSlug,
  upsertAttributesAndVariants,
  upsertDelivery,
  upsertImages,
  upsertProductData,
  upsertSeoMeta,
  upsertSettings,
  upsertSpecifications,
} from "./helpers";

const log = createLog("Product");

export async function upsertProduct(formData: unknown) {
  const session = await requireUser();

  if (!session) {
    return {
      success: false,
      error: "UNAUTHENTICATED",
      message: "User not authenticated",
    };
  }

  log.info("Received upsert request", { formData });

  const { success, data, error } = productSchema.safeParse(formData);
  if (!success) {
    log.warn("Validation failed for upsertCollection", { error });
    return {
      success: false,
      error: "Invalid data",
      message: z.prettifyError(error),
    };
  }

  try {
    const product = await db.transaction(async (tx) => {
      const uniqueSlug = await createProductSlug({
        title: data.title,
        customSlug: data.slug,
      });
      log.info("Generated unique slug", { uniqueSlug });

      let seoId: string | undefined = undefined;
      const { description, keywords, title } = data.meta;

      if (description || keywords || title) {
        log.info("Received meta info", data.meta);

        const seoResult = await upsertSeoMeta(tx, {
          productId: data.id,
          meta: data.meta,
        });
        seoId = seoResult.seoId;
      }

      const productData: ProductUpsertType = {
        ...data,
        slug: uniqueSlug,
        status: "active" as const,
        sellingPrice: data.price.selling,
        originalPrice: data.price.original,
        userId: session.user.id,
        vendorId: null,
      };

      const savedProduct = await upsertProductData(tx, {
        data: productData,
        seoId,
      });

      if (!savedProduct) throw new Error("Failed to save product data");

      await upsertSettings(tx, {
        productId: savedProduct.id,
        settings: data.settings,
      });

      await upsertSpecifications(tx, {
        productId: savedProduct.id,
        specifications: data.specifications,
      });

      const deliveryId = await upsertDelivery(tx, {
        product: {
          id: savedProduct.id,
          deliveryId: savedProduct.deliveryId,
        },
        delivery: data.delivery,
      });
      if (deliveryId) {
        savedProduct.deliveryId = deliveryId;
      }

      await upsertAttributesAndVariants(tx, {
        productId: savedProduct.id,
        hasVariant: data.hasVariant,
        attributes: data.attributes,
        variants: data.variants,
      });

      await upsertImages(tx, {
        productId: savedProduct.id,
        userId: session.user.id,
        images: data.images,
      });

      // Refetch to get all relations
      const finalProduct = await tx.query.productsTable.findFirst({
        where: (products, { eq }) => eq(products.id, savedProduct.id),
      });

      if (!finalProduct) throw new Error("Could not refetch product");

      log.success("Transaction completed for product", finalProduct.id);

      return finalProduct;
    });

    revalidateProductCaches(product.id, product.slug);
    log.success("Revalidated all product-related caches");

    return {
      success: true,
      error: null,
      message: `Product: (${product.title}) has been ${data.id ? "updated" : "created"}`,
    };
  } catch (error) {
    log.error("Upsert failed", { error });

    // Revert optimistic cache updates on error
    if (data.id) {
      try {
        const baseSlug = data.slug ?? slugify(data.title);
        log.info("Reverted optimistic cache updates due to error", baseSlug);
      } catch (cacheError) {
        log.warn("Failed to revert optimistic cache updates", { cacheError });
      }
    }

    return {
      success: false,
      error: "Database error",
      message: error instanceof Error ? error.message : error,
    };
  }
}
