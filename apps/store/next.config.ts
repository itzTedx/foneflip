import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ziron/ui", "@ziron/seo", "@ziron/db", "@ziron/auth", "@ziron/utils"],

  images: {
    remotePatterns: [{ hostname: "foneflip-local.s3.us-east-1.amazonaws.com" }],
  },
  allowedDevOrigins: ["192.168.1.158"],

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
