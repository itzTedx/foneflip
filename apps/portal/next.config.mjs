/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@ziron/ui",
    "@ziron/seo",
    "@ziron/db",
    "@ziron/auth",
    "@ziron/redis",
  ],

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
