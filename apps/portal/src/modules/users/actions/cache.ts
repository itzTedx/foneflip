"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { createLog } from "@/lib/utils";
import { CACHE_TAGS, REDIS_KEYS, redisCache } from "@/modules/cache";

const log = createLog("Users Cache");

/**
 * Invalidate user-related caches
 */
export const invalidateUserCaches = async (userId?: string, email?: string) => {
  try {
    // Revalidate Next.js cache tags
    revalidateTag(CACHE_TAGS.USERS);
    revalidateTag(CACHE_TAGS.USER);

    if (userId) {
      revalidateTag(`${CACHE_TAGS.USER_BY_ID}:${userId}`);
    }
    if (email) {
      revalidateTag(`${CACHE_TAGS.USER_BY_EMAIL}:${email}`);
    }

    // Revalidate user paths
    revalidatePath("/users");
    revalidatePath("/admin/users");

    // Invalidate Redis user keys
    const keysToInvalidate: string[] = [REDIS_KEYS.USERS, REDIS_KEYS.USERS_COUNT, REDIS_KEYS.USERS_METADATA];

    if (userId) {
      keysToInvalidate.push(REDIS_KEYS.USER_BY_ID(userId));
    }
    if (email) {
      keysToInvalidate.push(REDIS_KEYS.USER_BY_EMAIL(email));
    }

    await redisCache.del(...keysToInvalidate);
    await redisCache.invalidatePattern("user:*");

    log.info("Invalidated user caches", { userId, email });
  } catch (error) {
    log.warn("Failed to invalidate user caches", { userId, email, error });
  }
};
