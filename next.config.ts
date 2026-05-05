import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
