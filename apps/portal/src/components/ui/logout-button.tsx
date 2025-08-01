"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@ziron/utils";

import { signOut } from "@/lib/auth/client";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const LogoutButton = ({ children, className }: Props) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function logout() {
    startTransition(async () => {
      await signOut({
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
      aria-disabled={isPending}
      className={cn("flex cursor-pointer items-center gap-2", className)}
      disabled={isPending}
      onClick={logout}
    >
      {children}
    </button>
  );
};
