"use server";

import { db, eq } from "@ziron/db";
import { productsTable } from "@ziron/db/schema";
import { slugify } from "@ziron/utils";
import { productSchema, z } from "@ziron/validators";

import { createLog } from "@/lib/utils";
import { requireUser } from "@/modules/auth/actions/data-access";

import { ProductUpsertType } from "../types";
import { invalidateAndRevalidateCaches, updateCacheWithResult } from "./cache";
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

  let vendorId = data.vendorId;
  if (!vendorId && session.user?.role === "vendor") {
    const memberRecord = await db.query.member.findFirst({
      where: (m, { eq }) => eq(m.userId, session.user.id),
    });
    vendorId = memberRecord?.vendorId;
  }
  if ((!vendorId && session.user?.role === "admin") || session.user?.role === "dev") {
    const memberRecord = await db.query.member.findFirst({
      where: (m, { eq }) => eq(m.userId, session.user.id),
    });
    vendorId = memberRecord?.vendorId;
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

      const productData: ProductUpsertType & { status: "active" | "draft" | "archived" } = {
        ...data,
        slug: uniqueSlug,
        condition: data.condition ?? "new",
        status: "active" as const,
        sellingPrice: data.price.selling,
        originalPrice: data.price.original,
        userId: session.user.id,
        vendorId,
      };

      const savedProduct = await upsertProductData(tx, {
        data: productData,
        seoId,
        productId: data.id,
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

    // Update cache with the actual result
    try {
      await updateCacheWithResult(product, data.id ? "update" : "create");
      log.info("Updated cache with actual product data", {
        id: product.id,
        slug: product.slug,
      });
    } catch (cacheError) {
      log.warn("Cache update failed after database operation", {
        cacheError,
      });
    }

    // Invalidate Next.js caches
    log.info("Invalidating Next.js caches", {
      id: product.id,
      slug: product.slug,
    });
    await invalidateAndRevalidateCaches({
      id: product.id,
      slug: product.slug,
    });

    log.success("Revalidated all product-related caches");
    log.info("upsertProduct succeeded", { product });

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

export async function deleteProduct(id: string) {
  try {
    log.info(`Starting soft deletion for product with ID: ${id}`);

    const [product] = await db
      .update(productsTable)
      .set({ deletedAt: new Date() })
      .where(eq(productsTable.id, id))
      .returning({
        id: productsTable.id,
        title: productsTable.title,
        slug: productsTable.slug,
      });

    if (!product) {
      log.warn(`Soft deletion failed: Product with ID ${id} not found.`);
      return { error: "Product not found." };
    }

    // Comprehensive cache revalidation
    try {
      await invalidateAndRevalidateCaches({
        id: product.id,
        slug: product.slug,
      });
      log.info("Invalidated and revalidated all product-related caches", {
        id: product.id,
        slug: product.slug,
      });
    } catch (cacheError) {
      log.warn("Cache revalidation failed after product deletion", {
        cacheError,
      });
    }

    log.success(`Successfully soft-deleted product: "${product.title}" (ID: ${id})`);

    return {
      success: `Product (${product.title}) has been deleted`,
      data: product,
    };
  } catch (err) {
    log.error(`Error in deleteProduct action for ID: ${id}`, {
      error: err,
      message: err instanceof Error ? err.message : "Unknown error occurred",
      stack: err instanceof Error ? err.stack : undefined,
    });
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { error: `Failed to delete product: ${message}` };
  }
}
