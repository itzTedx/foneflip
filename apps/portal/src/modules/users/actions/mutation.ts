"use server";

import { revalidatePath } from "next/cache";

import { users } from "@ziron/db/schema";
import { db, eq } from "@ziron/db/server";

import { requireUser } from "@/modules/auth/actions/data-access";
import { deleteMediaFromS3 } from "@/modules/media/actions/mutations";

export async function deleteAvatar() {
  const session = await requireUser();
  const [deletedAvatar] = await db
    .update(users)
    .set({
      image: null,
    })
    .where(eq(users.id, session.user.id))
    .returning();

  if (deletedAvatar) {
    const url = deletedAvatar.image;
    if (url) {
      const key = url.split("/").slice(-1)[0];
      console.log("[DELETED_AVATAR]: ", key);
      await deleteMediaFromS3(key!);
    }
  }

  revalidatePath("/settings/profile");
}
