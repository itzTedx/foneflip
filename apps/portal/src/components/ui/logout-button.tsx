"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@ziron/auth/client";
import { cn } from "@ziron/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const LogoutButton = ({ children, className }: Props) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function logout() {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    });
  }
  return (
    <button
      onClick={logout}
      disabled={isPending}
      aria-disabled={isPending}
      className={cn("flex cursor-pointer items-center gap-2", className)}
    >
      {children}
    </button>
  );
};
