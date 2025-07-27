"use server";

import redis from "@ziron/redis";

export async function getUserSessions(userId: string) {
  console.log("User Id: ", userId);
  const sessionKeys = await redis.smembers(`active-sessions-${userId}`); // or lrange for list
  console.log("session keys: ", sessionKeys);

  if (sessionKeys.length === 0) return [];

  const pipeline = redis.multi();

  sessionKeys.forEach((token) => {
    pipeline.get(token);
  });

  const rawSessions = await pipeline.exec();

  // Convert to usable sessions
  const sessions = rawSessions
    ?.map(([, session]) => {
      try {
        return session ? JSON.parse(session) : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean); // remove nulls

  return sessions;
}
