import { unstable_cache as cache } from "next/cache";
import { getSession } from "@/lib/auth/server";

import { db, desc, eq, sql } from "@ziron/db";
import { mediaTable } from "@ziron/db/schema";

import { CACHE_DURATIONS, CACHE_TAGS } from "./cache";

const DEFAULT_MEDIA_PAGE_SIZE = 20;

const getMediaInternal = cache(
  async (page: number, pageSize: number, userId: string, isAdmin: boolean) => {
    const offset = (page - 1) * pageSize;

    const where = !isAdmin ? eq(mediaTable.userId, userId) : undefined;

    const mediaPromise = db.query.mediaTable.findMany({
      with: {
        user: true,
      },
      orderBy: desc(mediaTable.createdAt),
      limit: pageSize,
      offset,
      where,
    });

    const countPromise = db
      .select({ count: sql<number>`count(*)` })
      .from(mediaTable)
      .where(where);

    const [media, countResult] = await Promise.all([
      mediaPromise,
      countPromise,
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    return { media, total };
  },
  [CACHE_TAGS.MEDIA],
  {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.MEDIA],
  }
);

export const getMedia = async (
  page = 1,
  pageSize = DEFAULT_MEDIA_PAGE_SIZE
) => {
  const session = await getSession();

  if (!session?.user?.id) {
    return { media: [], total: 0 };
  }
  const { user } = session;

  return getMediaInternal(page, pageSize, user.id, user.role === "admin");
};
