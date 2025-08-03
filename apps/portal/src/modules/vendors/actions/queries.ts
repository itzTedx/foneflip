"use server";

import { unstable_cache as cache } from "next/cache";

import { and, desc, eq, gt, isNull, or } from "drizzle-orm";

import { vendorInvitations, vendorsTable } from "@ziron/db/schema";
import { db } from "@ziron/db/server";
import type { Vendor } from "@ziron/db/types";

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

// Get all vendors regardless of status with comprehensive caching (Redis + Next.js)
export const getVendors = cache(
  async (): Promise<Vendor[]> => {
    try {
      // Try to get from Redis cache first
      const cachedVendors = await redisCache.get<Vendor[]>(REDIS_KEYS.VENDORS);
      if (cachedVendors) {
        log.info("Vendors found in Redis cache", { count: cachedVendors.length });
        return cachedVendors;
      }

      const vendors = await db.query.vendorsTable.findMany({
        orderBy: (vendors, { desc }) => desc(vendors.createdAt),
        with: {
          members: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  emailVerified: true,
                  image: true,
                  role: true,
                  banned: true,
                  banReason: true,
                  banExpires: true,
                  twoFactorEnabled: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
          documents: true,
        },
      });

      // Cache the result in Redis
      await redisCache.set(REDIS_KEYS.VENDORS, vendors, CACHE_DURATIONS.LONG);

      log.info("Vendors fetched from database and cached", { count: vendors.length });
      return vendors;
    } catch (error) {
      log.error("Failed to get vendors", { error });
      return [];
    }
  },
  [CACHE_TAGS.VENDOR, "all"],
  {
    revalidate: CACHE_DURATIONS.LONG,
    tags: [CACHE_TAGS.VENDOR, CACHE_TAGS.VENDOR_INVITATIONS],
  }
);

// Get vendor by ID with comprehensive caching (Redis + Next.js)
export const getVendorById = async (id: string) =>
  cache(
    async (): Promise<InvitationResponse<Vendor>> => {
      try {
        // Validate ID input
        if (!id || typeof id !== "string" || id.trim().length === 0) {
          return {
            success: false,
            error: "Invalid vendor ID provided",
          };
        }

        // Try to get from Redis cache first
        const cachedVendor = await redisCache.get<Vendor>(REDIS_KEYS.VENDOR_BY_ID(id));
        if (cachedVendor) {
          return {
            success: true,
            data: cachedVendor,
          };
        }

        const vendor = await db.query.vendorsTable.findFirst({
          where: eq(vendorsTable.id, id),
          with: {
            members: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    email: true,
                    emailVerified: true,
                    image: true,
                    role: true,
                    banned: true,
                    banReason: true,
                    banExpires: true,
                    twoFactorEnabled: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
            documents: true,
          },
        });

        if (!vendor) {
          return {
            success: false,
            error: "Vendor not found",
          };
        }

        // Cache the vendor in Redis
        await redisCache.set(REDIS_KEYS.VENDOR_BY_ID(id), vendor, CACHE_DURATIONS.MEDIUM);

        return {
          success: true,
          data: vendor,
        };
      } catch (error) {
        // Log the error for debugging
        log.error("Error in getVendorById:", error);

        // Return structured error response
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch vendor",
        };
      }
    },
    [`vendor-by-id:${id}`],
    {
      revalidate: CACHE_DURATIONS.MEDIUM,
      tags: [CACHE_TAGS.VENDOR_BY_ID, CACHE_TAGS.VENDOR, `${CACHE_TAGS.VENDOR_BY_ID}:${id}`],
    }
  )();
