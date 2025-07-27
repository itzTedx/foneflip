"use server";

import { db, desc } from "@ziron/db";
import { users } from "@ziron/db/schema";

export async function getUsers() {
  const notifications = await db.query.users.findMany({
    orderBy: desc(users.createdAt),
  });

  return notifications;
}
