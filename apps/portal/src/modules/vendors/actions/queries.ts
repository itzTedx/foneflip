"use server";

import { unstable_cache as cache } from "next/cache";

import { and, desc, eq, gt, isNull, or } from "drizzle-orm";

import { db } from "@ziron/db";
import { vendorInvitations } from "@ziron/db/schema";

import { createLog } from "@/lib/utils";
import { CACHE_TAGS, REDIS_KEYS, redisCache } from "@/modules/cache";
import { CACHE_DURATIONS } from "@/modules/cache/constants";

import { InvitationType } from "../types";

// Enhanced invitation type with computed status
interface InvitationWithStatus extends InvitationType {
  status: "revoked" | "accepted" | "expired" | "pending";
}

export type InvitationResponse<T = unknown> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

const log = createLog("Vendor");

// Get invitation by token with comprehensive caching (Redis + Next.js)
export const getInvitationByToken = async (token: string) =>
  cache(
    async (): Promise<InvitationResponse<InvitationType>> => {
      try {
        // Validate token input
        if (!token || typeof token !== "string" || token.trim().length === 0 || token.length > 512) {
          return {
            success: false,
            error: "Invalid invitation token provided",
          };
        }

        // Try to get from Redis cache first
        const cachedInvitation = await redisCache.get<InvitationType>(REDIS_KEYS.VENDOR_INVITATION_BY_TOKEN(token));
        if (cachedInvitation) {
          log.info("Invitation found in Redis cache", { token });
          return {
            success: true,
            data: cachedInvitation,
          };
        }

        const invitation = await db.query.vendorInvitations.findFirst({
          where: and(
            eq(vendorInvitations.token, token),
            isNull(vendorInvitations.deletedAt),
            isNull(vendorInvitations.revokedAt),
            // Allow access if invitation is not expired OR if it's already used (expiresAt is null)
            or(gt(vendorInvitations.expiresAt, new Date()), isNull(vendorInvitations.expiresAt))
          ),
        });

        if (!invitation) {
          return {
            success: false,
            error: "Invitation not found or has expired",
          };
        }

        // Cache the invitation in Redis
        await redisCache.set(REDIS_KEYS.VENDOR_INVITATION_BY_TOKEN(token), invitation, CACHE_DURATIONS.MEDIUM);

        log.info("Invitation fetched from database and cached", { token });
        return {
          success: true,
          data: invitation,
        };
      } catch (error) {
        // Log the error for debugging
        log.error("Error in getInvitationByToken:", error);

        // Return structured error response
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to validate invitation",
        };
      }
    },
    [`invitation-by-token:${token}`],
    {
      revalidate: CACHE_DURATIONS.SHORT,
      tags: [
        CACHE_TAGS.VENDOR_INVITATION_BY_TOKEN,
        CACHE_TAGS.VENDOR_INVITATIONS,
        CACHE_TAGS.VENDOR,
        `${CACHE_TAGS.VENDOR_INVITATION_BY_TOKEN}:${token}`,
      ],
    }
  )();

// Get all vendor invitations with comprehensive caching (Redis + Next.js)
export const getVendorInvitations = cache(
  async (): Promise<InvitationWithStatus[]> => {
    try {
      // Try to get from Redis cache first
      const cachedInvitations = await redisCache.get<InvitationWithStatus[]>(REDIS_KEYS.VENDOR_INVITATIONS);
      if (cachedInvitations) {
        log.info("Vendor invitations found in Redis cache", { count: cachedInvitations.length });
        return cachedInvitations;
      }

      const invitations = await db.query.vendorInvitations.findMany({
        where: isNull(vendorInvitations.deletedAt),
        orderBy: desc(vendorInvitations.createdAt),
      });

      // Add computed status field to each invitation
      const invitationsWithStatus = invitations.map((invitation) => {
        let status: "revoked" | "accepted" | "expired" | "pending";

        if (invitation.revokedAt) {
          status = "revoked";
        } else if (invitation.usedAt) {
          status = "accepted";
        } else if (invitation.expiresAt && invitation.expiresAt < new Date()) {
          status = "expired";
        } else {
          status = "pending";
        }

        return {
          ...invitation,
          status,
        };
      });

      // Cache the result in Redis
      await redisCache.set(REDIS_KEYS.VENDOR_INVITATIONS, invitationsWithStatus, CACHE_DURATIONS.MEDIUM);

      log.info("Vendor invitations fetched from database and cached", { count: invitationsWithStatus.length });
      return invitationsWithStatus;
    } catch (error) {
      log.error("Failed to get vendor invitations", { error });
      return [];
    }
  },
  [CACHE_TAGS.VENDOR_INVITATIONS],
  {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: [
      CACHE_TAGS.VENDOR_INVITATIONS,
      CACHE_TAGS.VENDOR,
      CACHE_TAGS.VENDOR_INVITATION_BY_TOKEN,
      CACHE_TAGS.VENDOR_INVITATION_BY_EMAIL,
    ],
  }
);

// Get pending invitations with comprehensive caching (Redis + Next.js)
export const getPendingInvitations = cache(
  async (): Promise<InvitationWithStatus[]> => {
    try {
      const cacheKey = `${REDIS_KEYS.VENDOR_INVITATIONS}:pending`;
      const cachedInvitations = await redisCache.get<InvitationWithStatus[]>(cacheKey);
      if (cachedInvitations) {
        log.info("Pending invitations found in Redis cache", { count: cachedInvitations.length });
        return cachedInvitations;
      }

      const invitations = await db.query.vendorInvitations.findMany({
        where: and(
          isNull(vendorInvitations.deletedAt),
          isNull(vendorInvitations.revokedAt),
          isNull(vendorInvitations.usedAt),
          gt(vendorInvitations.expiresAt, new Date())
        ),
        orderBy: desc(vendorInvitations.createdAt),
      });

      const invitationsWithStatus = invitations.map((invitation) => ({
        ...invitation,
        status: "pending" as const,
      }));

      // Cache the result in Redis
      await redisCache.set(cacheKey, invitationsWithStatus, CACHE_DURATIONS.SHORT);

      log.info("Pending invitations fetched from database and cached", { count: invitationsWithStatus.length });
      return invitationsWithStatus;
    } catch (error) {
      log.error("Failed to get pending invitations", { error });
      return [];
    }
  },
  [CACHE_TAGS.VENDOR_INVITATIONS],
  {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [
      CACHE_TAGS.VENDOR_INVITATIONS,
      CACHE_TAGS.VENDOR,
      CACHE_TAGS.VENDOR_INVITATION_BY_TOKEN,
      CACHE_TAGS.VENDOR_INVITATION_BY_EMAIL,
    ],
  }
);

import { revalidatePath, revalidateTag } from "next/cache";

// Cache invalidation functions for vendor invitations (Redis + Next.js)
export const invalidateVendorInvitationCaches = async (token?: string, email?: string) => {
  try {
    // Invalidate Next.js cache tags
    revalidateTag(CACHE_TAGS.VENDOR_INVITATIONS);
    revalidateTag(CACHE_TAGS.VENDOR);
    revalidateTag(CACHE_TAGS.VENDOR_INVITATION_BY_TOKEN);
    revalidateTag(CACHE_TAGS.VENDOR_INVITATION_BY_EMAIL);

    if (token) {
      revalidateTag(`${CACHE_TAGS.VENDOR_INVITATION_BY_TOKEN}:${token}`);
    }
    if (email) {
      revalidateTag(`${CACHE_TAGS.VENDOR_INVITATION_BY_EMAIL}:${email}`);
    }

    // Revalidate relevant paths
    revalidatePath("/vendors");
    revalidatePath("/vendor");
    revalidatePath("/admin/vendors");
    revalidatePath("/admin/invitations");

    // Invalidate Redis caches
    const keysToInvalidate: string[] = [REDIS_KEYS.VENDOR_INVITATIONS];

    if (token) {
      keysToInvalidate.push(REDIS_KEYS.VENDOR_INVITATION_BY_TOKEN(token));
    }
    if (email) {
      keysToInvalidate.push(REDIS_KEYS.VENDOR_INVITATION_BY_EMAIL(email));
    }

    // Also invalidate pending invitations cache
    keysToInvalidate.push(`${REDIS_KEYS.VENDOR_INVITATIONS}:pending`);

    await redisCache.del(...keysToInvalidate);
    log.info("Invalidated vendor invitation caches (Redis + Next.js + Paths)", { token, email });
  } catch (error) {
    log.warn("Failed to invalidate vendor invitation caches", { error });
  }
};

// Update vendor invitation cache with new data (Redis + Next.js)
export const updateVendorInvitationCache = async (invitation: InvitationType) => {
  try {
    // Update Redis caches
    await Promise.all([
      redisCache.set(REDIS_KEYS.VENDOR_INVITATION_BY_TOKEN(invitation.token!), invitation, CACHE_DURATIONS.MEDIUM),
      redisCache.set(REDIS_KEYS.VENDOR_INVITATION_BY_EMAIL(invitation.vendorEmail), invitation, CACHE_DURATIONS.MEDIUM),
    ]);

    // Revalidate Next.js cache tags
    revalidateTag(CACHE_TAGS.VENDOR_INVITATIONS);
    revalidateTag(CACHE_TAGS.VENDOR);
    revalidateTag(`${CACHE_TAGS.VENDOR_INVITATION_BY_TOKEN}:${invitation.token}`);
    revalidateTag(`${CACHE_TAGS.VENDOR_INVITATION_BY_EMAIL}:${invitation.vendorEmail}`);

    // Revalidate relevant paths
    revalidatePath("/vendors");
    revalidatePath("/vendor");
    revalidatePath("/admin/vendors");
    revalidatePath("/admin/invitations");

    log.info("Updated vendor invitation cache (Redis + Next.js + Paths)", {
      token: invitation.token,
      email: invitation.vendorEmail,
    });
  } catch (error) {
    log.warn("Failed to update vendor invitation cache", { error });
  }
};

// Clear all vendor invitation caches (Redis + Next.js)
export const clearAllVendorInvitationCaches = async () => {
  try {
    // Revalidate all Next.js cache tags
    revalidateTag(CACHE_TAGS.VENDOR_INVITATIONS);
    revalidateTag(CACHE_TAGS.VENDOR);
    revalidateTag(CACHE_TAGS.VENDOR_INVITATION_BY_TOKEN);
    revalidateTag(CACHE_TAGS.VENDOR_INVITATION_BY_EMAIL);

    // Revalidate all relevant paths
    revalidatePath("/vendors");
    revalidatePath("/vendor");
    revalidatePath("/admin/vendors");
    revalidatePath("/admin/invitations");
    revalidatePath("/admin");
    revalidatePath("/");

    // Invalidate all Redis patterns
    await redisCache.invalidatePattern("vendor-invitation:*");
    await redisCache.invalidatePattern("vendor-invitations:*");

    log.info("Cleared all vendor invitation caches (Redis + Next.js + Paths)");
  } catch (error) {
    log.warn("Failed to clear all vendor invitation caches", { error });
  }
};
