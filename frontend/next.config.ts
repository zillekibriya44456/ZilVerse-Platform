import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allows builds to succeed even if there are ESLint warnings/errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allows builds to succeed even if there are TypeScript warnings/errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
