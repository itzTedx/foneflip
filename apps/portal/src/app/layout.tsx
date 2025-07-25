import "@ziron/ui/globals.css";
import { Geist } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { Providers } from "@/components/providers";
import type { Metadata } from "next";

import { createMetadata } from "@ziron/seo";
import { cn } from "@ziron/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const generateMetadata = (): Metadata => {
  return createMetadata({
    title: "Testing",
    description: "Testing shadcn",
  });
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("no-scrollbar")}>
      <body className={cn("antialiased", geistSans.className)}>
        <NuqsAdapter>
          
        <Providers>{children}</Providers>
      </NuqsAdapter>
      </body>
    </html>
  );
}
