import { unstable_cache as cache } from "next/cache";

import { db, eq } from "@ziron/db";
import { productsTable } from "@ziron/db/schema";

import { redisCache } from "@/modules/cache";
import { CACHE_DURATIONS } from "@/modules/cache/constants";
import { withSmartCacheMonitoring } from "@/modules/collections/utils/cache-monitor";

import { CACHE_TAGS, REDIS_KEYS } from "./cache";

export const existingProduct = cache(
  async (slug: string) => {
    return withSmartCacheMonitoring(async () => {
      // Try Redis first
      const cached = await redisCache.get(REDIS_KEYS.PRODUCT_BY_SLUG(slug));
      if (cached) {
        return cached;
      }

      // Fallback to database
      const product = await db.query.productsTable.findFirst({
        where: eq(productsTable.slug, slug),
      });

      // Cache the result
      if (product) {
        await redisCache.set(REDIS_KEYS.PRODUCT_BY_SLUG(slug), product, CACHE_DURATIONS.MEDIUM);
      }

      return product;
    }, REDIS_KEYS.PRODUCT_BY_SLUG(slug));
  },
  ["existing-product"],
  {
    tags: [CACHE_TAGS.PRODUCT_BY_SLUG],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);
