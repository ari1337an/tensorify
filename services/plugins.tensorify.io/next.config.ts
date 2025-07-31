import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  // output: "standalone",

  // Optimize for production builds
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all domains
      },
    ],
    domains: ["github.com", "avatars.githubusercontent.com"],
    formats: ["image/webp", "image/avif"],
  },

  async headers() {
    return [
      {
        // Security headers for the application
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // External packages for server components
  serverExternalPackages: ["@aws-sdk/client-s3"],

  // Webpack configuration for better build optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't include AWS SDK in client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;
