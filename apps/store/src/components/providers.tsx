"use client";
import { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@ziron/ui/sonner";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      <Toaster richColors />
    </>
  );
}
