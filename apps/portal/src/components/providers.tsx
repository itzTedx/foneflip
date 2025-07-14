"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { Toaster } from "@ziron/ui/components/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <ProgressProvider
        height="3px"
        color="#962DFF"
        options={{ showSpinner: false }}
        shallowRouting
        memo
      >
        {children}
      </ProgressProvider>
      <Toaster />
    </NextThemesProvider>
  );
}
