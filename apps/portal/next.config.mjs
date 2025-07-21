/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@ziron/ui",
    "@ziron/seo",
    "@ziron/db",
    "@ziron/auth",
    "@ziron/redis",
    "@ziron/utils",
  ],

  images: {
    remotePatterns: [{ hostname: "foneflip-local.s3.us-east-1.amazonaws.com" }],
  },

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
