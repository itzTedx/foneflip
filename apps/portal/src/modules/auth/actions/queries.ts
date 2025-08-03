"use server";

import { unstable_cache as cache, revalidateTag } from "next/cache";

import redis from "@ziron/redis";

import { createLog } from "@/lib/utils";
import { redisCache } from "@/modules/cache";

// Session type definition
interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  [key: string]: unknown;
}

// Auth-specific cache constants
const AUTH_CACHE_TAGS = {
  USER_SESSIONS: "user-sessions",
  USER_SESSION_BY_ID: "user-session-by-id",
  ACTIVE_SESSIONS: "active-sessions",
} as const;

const AUTH_REDIS_KEYS = {
  USER_SESSIONS: (userId: string) => `user:sessions:${userId}`,
  USER_SESSION_BY_ID: (userId: string) => `user:session:${userId}`,
  ACTIVE_SESSIONS: (userId: string) => `active-sessions:${userId}`,
} as const;

const log = createLog("Auth");

// Cache duration for user sessions (shorter TTL for security)
const SESSION_CACHE_TTL = 300; // 5 minutes

/**
 * Get user sessions with comprehensive caching strategy
 */
export const getUserSessions = cache(
  async (userId: string) => {
    log.info("Fetching user sessions", { userId });

    try {
      // Try to get from cache first
      const cachedSessions = await redisCache.get<UserSession[]>(AUTH_REDIS_KEYS.USER_SESSIONS(userId));
      if (cachedSessions) {
        log.info("User sessions found in cache", { userId, sessionCount: cachedSessions.length });
        return cachedSessions;
      }

      // If not in cache, fetch from Redis
      const sessionKeys = await redis.smembers(AUTH_REDIS_KEYS.ACTIVE_SESSIONS(userId));
      log.info("Session keys retrieved from Redis", { userId, keyCount: sessionKeys.length });

      if (sessionKeys.length === 0) {
        // Cache empty result to prevent repeated lookups
        await redisCache.set(AUTH_REDIS_KEYS.USER_SESSIONS(userId), [], SESSION_CACHE_TTL);
        log.info("Cached empty sessions result", { userId });
        return [];
      }

      // Fetch all sessions using pipeline for efficiency
      const pipeline = redis.multi();
      sessionKeys.forEach((token) => {
        pipeline.get(token);
      });

      const rawSessions = await pipeline.exec();

      // Convert to usable sessions
      const sessions = rawSessions
        ?.map(([, result]) => {
          try {
            const session = result as string | null;
            return session ? (JSON.parse(session) as UserSession) : null;
          } catch (error) {
            log.warn("Failed to parse session data", { error });
            return null;
          }
        })
        .filter(Boolean) as UserSession[]; // remove nulls

      // Cache the result
      await redisCache.set(AUTH_REDIS_KEYS.USER_SESSIONS(userId), sessions, SESSION_CACHE_TTL);

      log.success("User sessions fetched and cached", {
        userId,
        sessionCount: sessions.length,
        cacheKey: AUTH_REDIS_KEYS.USER_SESSIONS(userId),
      });

      return sessions;
    } catch (error) {
      log.error("Failed to get user sessions", { userId, error });
      return [];
    }
  },
  ["user-sessions"],
  {
    tags: [AUTH_CACHE_TAGS.USER_SESSIONS, AUTH_CACHE_TAGS.USER_SESSION_BY_ID],
    revalidate: SESSION_CACHE_TTL,
  }
);

/**
 * Invalidate user session caches
 */
export const invalidateUserSessionCaches = async (userId: string) => {
  try {
    // Revalidate Next.js cache tags
    revalidateTag(AUTH_CACHE_TAGS.USER_SESSIONS);
    revalidateTag(AUTH_CACHE_TAGS.USER_SESSION_BY_ID);
    revalidateTag(AUTH_CACHE_TAGS.ACTIVE_SESSIONS);

    // Invalidate Redis caches
    await redisCache.del(AUTH_REDIS_KEYS.USER_SESSIONS(userId), AUTH_REDIS_KEYS.USER_SESSION_BY_ID(userId));

    log.info("Invalidated user session caches", { userId });
  } catch (error) {
    log.warn("Failed to invalidate user session caches", { userId, error });
  }
};

/**
 * Update user session cache with new data
 */
export const updateUserSessionCache = async (userId: string, sessions: UserSession[]) => {
  try {
    await redisCache.set(AUTH_REDIS_KEYS.USER_SESSIONS(userId), sessions, SESSION_CACHE_TTL);
    log.info("Updated user session cache", { userId, sessionCount: sessions.length });
  } catch (error) {
    log.warn("Failed to update user session cache", { userId, error });
  }
};

/**
 * Clear all user session caches
 */
export const clearAllUserSessionCaches = async () => {
  try {
    // Revalidate all auth-related cache tags
    Object.values(AUTH_CACHE_TAGS).forEach((tag) => {
      revalidateTag(tag);
    });

    // Invalidate all auth-related Redis keys
    await redisCache.invalidatePattern("user:sessions:*");
    await redisCache.invalidatePattern("user:session:*");
    await redisCache.invalidatePattern("active-sessions:*");

    log.info("Cleared all user session caches");
  } catch (error) {
    log.warn("Failed to clear all user session caches", { error });
  }
};
