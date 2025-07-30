"use server";

import { db } from "@ziron/db";
import { slugify } from "@ziron/utils";
import { productSchema, z } from "@ziron/validators";

import { createLog } from "@/lib/utils";
import { requireUser } from "@/modules/auth/actions/data-access";

import { ProductUpsertType } from "../types";
import { createProductSlug, upsertProductData, upsertSeoMeta } from "./helpers";

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
    return await db.transaction(async (tx) => {
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

      if (!savedProduct)
        return {
          success: false,
          error: "INVALID_VENDOR_ID",
          message: "Updating product data into database failed. Please contact technical support",
        };

      return {
        success: true,
        error: null,
        message: `${data.title} has been created`,
      };
    });
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
