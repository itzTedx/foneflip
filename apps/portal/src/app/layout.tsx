import { Geist } from "next/font/google";

import "@ziron/ui/globals.css";

import type { Metadata } from "next";
import { Providers } from "@/components/providers";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
