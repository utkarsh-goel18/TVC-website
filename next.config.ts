import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Legacy pages contain unescaped entities; ignore during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
