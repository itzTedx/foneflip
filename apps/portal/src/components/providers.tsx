"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { Toaster } from "@ziron/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableColorScheme
      enableSystem
    >
      <ProgressProvider color="#962DFF" height="3px" memo options={{ showSpinner: false }} shallowRouting>
        {children}
      </ProgressProvider>
      <Toaster closeButton position="top-center" richColors />
    </NextThemesProvider>
  );
}
