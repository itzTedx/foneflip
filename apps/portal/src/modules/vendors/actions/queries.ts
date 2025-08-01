"use server";

import { unstable_cache as cache } from "next/cache";

import { and, eq, gt, isNull, or } from "drizzle-orm";

import { db } from "@ziron/db";
import { vendorInvitations } from "@ziron/db/schema";

import { CACHE_TAGS } from "@/modules/cache";
import { CACHE_DURATIONS } from "@/modules/cache/constants";

import { InvitationType } from "../types";

export type InvitationResponse<T = unknown> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

// Get invitation by token with caching and proper error handling
export const getInvitationByToken = async (token: string) =>
  cache(
    async (): Promise<InvitationResponse<InvitationType>> => {
      try {
        // Validate token input
        if (!token || typeof token !== "string" || token.trim().length === 0) {
          return {
            success: false,
            error: "Invalid invitation token provided",
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

        return {
          success: true,
          data: invitation,
        };
      } catch (error) {
        // Log the error for debugging
        console.error("Error in getInvitationByToken:", error);

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
        `${CACHE_TAGS.VENDOR_INVITATION_BY_TOKEN}:${token}`,
      ],
    }
  )();
