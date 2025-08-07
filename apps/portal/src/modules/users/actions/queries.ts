"use server";

import { unstable_cache as cache } from "next/cache";

import { users } from "@ziron/db/schema";
import { db, desc } from "@ziron/db/server";

import { CACHE_TAGS, REDIS_KEYS, redisCache } from "@/modules/cache";
import { CACHE_DURATIONS } from "@/modules/cache/constants";
import { withCacheMonitoring } from "@/modules/collections/utils/cache-monitor";

import type { UsersQueryResult } from "../types";

export const getUsers = cache(
  async (): Promise<UsersQueryResult> => {
    return withCacheMonitoring(
      async () => {
        // Try Redis first
        const cached = await redisCache.get<UsersQueryResult>(REDIS_KEYS.USERS);
        if (cached) {
          return cached;
        }

        // Fallback to database
        const usersList = await db.query.users.findMany({
          orderBy: desc(users.createdAt),
        });

        // Cache the result
        await redisCache.set(REDIS_KEYS.USERS, usersList, CACHE_DURATIONS.LONG);

        return usersList;
      },
      REDIS_KEYS.USERS,
      false // This is a miss since we're fetching fresh data
    );
  },
  ["get-users"],
  {
    tags: [CACHE_TAGS.USERS],
    revalidate: CACHE_DURATIONS.LONG,
  }
);
