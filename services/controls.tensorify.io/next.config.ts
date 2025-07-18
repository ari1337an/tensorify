import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
