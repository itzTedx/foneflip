import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS, REDIS_KEYS, redisCache } from "@/modules/cache";

/**
 * Invalidate vendor-related caches
 */
export const invalidateVendorCaches = async (vendorId?: string, invitationToken?: string, invitationEmail?: string) => {
  // Revalidate Next.js vendor tags
  revalidateTag(CACHE_TAGS.VENDOR);
  revalidateTag(CACHE_TAGS.VENDORS);
  revalidateTag(CACHE_TAGS.VENDOR_INVITATIONS);
  revalidateTag(CACHE_TAGS.VENDOR_PROFILE);
  revalidateTag(CACHE_TAGS.VENDOR_STATUS);
  revalidateTag(CACHE_TAGS.VENDOR_DOCUMENTS);
  revalidateTag(CACHE_TAGS.VENDOR_BUSINESS);
  revalidateTag(CACHE_TAGS.VENDOR_PERSONAL);

  if (vendorId) {
    revalidateTag(`${CACHE_TAGS.VENDOR_BY_ID}:${vendorId}`);
  }
  if (invitationToken) {
    revalidateTag(`${CACHE_TAGS.VENDOR_INVITATION_BY_TOKEN}:${invitationToken}`);
  }
  if (invitationEmail) {
    revalidateTag(`${CACHE_TAGS.VENDOR_INVITATION_BY_EMAIL}:${invitationEmail}`);
  }

  // Revalidate vendor paths
  revalidatePath("/vendors");
  revalidatePath("/vendor");
  revalidatePath("/vendor/[slug]", "page");

  // Invalidate Redis vendor keys
  const keysToInvalidate: string[] = [REDIS_KEYS.VENDORS, REDIS_KEYS.VENDOR_INVITATIONS];

  if (vendorId) {
    keysToInvalidate.push(REDIS_KEYS.VENDOR_BY_ID(vendorId));
  }
  if (invitationToken) {
    keysToInvalidate.push(REDIS_KEYS.VENDOR_INVITATION_BY_TOKEN(invitationToken));
  }
  if (invitationEmail) {
    keysToInvalidate.push(REDIS_KEYS.VENDOR_INVITATION_BY_EMAIL(invitationEmail));
  }

  await redisCache.del(...keysToInvalidate);
  await redisCache.invalidatePattern("vendor:*");
  await redisCache.invalidatePattern("vendor-invitation:*");
};

/**
 * Invalidate all vendor caches
 */
export const invalidateAllVendorCaches = async () => {
  // Revalidate all vendor-related Next.js tags
  Object.values(CACHE_TAGS)
    .filter((tag) => tag.startsWith("vendor"))
    .forEach((tag) => {
      revalidateTag(tag);
    });

  // Revalidate vendor paths
  revalidatePath("/vendors");
  revalidatePath("/vendor");
  revalidatePath("/vendor/[slug]", "page");

  // Invalidate all Redis vendor keys
  await redisCache.invalidatePattern("vendor:*");
  await redisCache.invalidatePattern("vendor-invitation:*");
};

/**
 * Warm vendor cache with data
 */
export const warmVendorCache = async (vendorId: string, data: unknown) => {
  try {
    await redisCache.set(REDIS_KEYS.VENDOR_BY_ID(vendorId), data);
  } catch (error) {
    console.error("Failed to warm vendor cache:", error);
  }
};

/**
 * Warm all vendor caches
 */
export const warmAllVendorCaches = async () => {
  try {
    // This would typically fetch all vendors and cache them
    // Implementation depends on your data fetching strategy
    console.log("Warming vendor caches...");
  } catch (error) {
    console.error("Failed to warm vendor caches:", error);
  }
};

/**
 * Invalidate invitation caches after verification
 */
export const invalidateInvitationAfterVerification = async (token: string, email: string) => {
  try {
    // Invalidate Next.js cache tags
    revalidateTag(CACHE_TAGS.VENDOR_INVITATIONS);
    revalidateTag(CACHE_TAGS.VENDOR);
    revalidateTag(`${CACHE_TAGS.VENDOR_INVITATION_BY_TOKEN}:${token}`);
    revalidateTag(`${CACHE_TAGS.VENDOR_INVITATION_BY_EMAIL}:${email}`);

    // Invalidate Redis cache keys
    await redisCache.del(
      REDIS_KEYS.VENDOR_INVITATIONS,
      REDIS_KEYS.VENDOR_INVITATION_BY_TOKEN(token),
      REDIS_KEYS.VENDOR_INVITATION_BY_EMAIL(email)
    );

    console.log("Invalidated invitation caches after verification", { token, email });
  } catch (error) {
    console.error("Failed to invalidate invitation caches after verification:", error);
  }
};
