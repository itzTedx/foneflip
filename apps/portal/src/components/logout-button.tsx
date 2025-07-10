"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@ziron/auth/client";
import { Button } from "@ziron/ui/components/button";

export const LogoutButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function logout() {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login"); // redirect to login page
          },
        },
      });
    });
  }
  return (
    <Button onClick={logout} disabled={isPending} aria-disabled={isPending}>
      Logout
    </Button>
  );
};
