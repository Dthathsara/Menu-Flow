import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://localhost:3001/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
