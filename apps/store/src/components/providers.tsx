"use client";
import { ReactNode } from "react";

import { Toaster } from "@ziron/ui/sonner";

import { TRPCReactProvider } from "@/lib/trpc/react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <TRPCReactProvider>{children}</TRPCReactProvider>
      <Toaster richColors />
    </>
  );
}
