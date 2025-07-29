"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { Toaster } from "@ziron/ui/sonner";

/**
 * Wraps application content with global providers for theming, progress bar, and toast notifications.
 *
 * Renders the given children within context providers that manage theme selection, display a progress bar during navigation, and enable toast notifications across the app.
 *
 * @param children - The components to be rendered within the global providers
 */
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
