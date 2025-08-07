"use server";

import { users } from "@ziron/db/schema";
import { db, desc } from "@ziron/db/server";

export async function getUsers() {
  const notifications = await db.query.users.findMany({
    orderBy: desc(users.createdAt),
  });

  return notifications;
}
