import "@ziron/ui/globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import { createMetadata } from "@ziron/seo";
import { cn } from "@ziron/utils";

import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const generateMetadata = (): Metadata => {
  return createMetadata({
    title: "Foneflip",
    description: "Testing shadcn",
  });
};

/**
 * Defines the root layout for the Next.js application, applying global styles, font, and context providers.
 *
 * Wraps all page content with necessary providers and sets up the HTML structure and language attributes.
 *
 * @param children - The content to be rendered within the layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={cn("no-scrollbar")} lang="en" suppressHydrationWarning>
      <body className={cn("antialiased", geistSans.className)}>
        <NuqsAdapter>
          <Providers>{children}</Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
