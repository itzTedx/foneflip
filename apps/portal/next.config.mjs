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

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
