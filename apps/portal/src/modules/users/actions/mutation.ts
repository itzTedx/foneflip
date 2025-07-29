"use server";

import { requireUser } from "@/modules/auth/actions/data-access";
import { deleteMediaFromS3 } from "@/modules/media/actions/mutations";
import { revalidatePath } from "next/cache";

import { db, eq } from "@ziron/db";
import { users } from "@ziron/db/schema";

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
