"use client";

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
      {children}
      <Toaster />
    </NextThemesProvider>
  );
}
