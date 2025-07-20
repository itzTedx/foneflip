"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@ziron/ui/components/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
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
        <Toaster richColors closeButton position="top-center" />
      </NextThemesProvider>
    </NuqsAdapter>
  );
}
