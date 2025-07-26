"use server";

import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

export async function getUsers() {
  const users = await auth.api.listUsers({
    query: {
        sortBy: "createdAt",
        sortDirection: "desc",
       
    },
    // This endpoint requires session cookies.
    headers: await headers(),
  });
  console.log(users)
  return users;
}

