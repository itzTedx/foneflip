import { Geist, Geist_Mono } from "next/font/google";

import "@ziron/ui/globals.css";

import type { Metadata } from "next";
import { Providers } from "@/components/providers";

import { createMetadata } from "@ziron/seo";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
