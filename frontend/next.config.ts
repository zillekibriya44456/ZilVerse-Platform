import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allows builds to succeed even if there are TypeScript warnings/errors
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" }
    ],
  },
};

export default nextConfig;
