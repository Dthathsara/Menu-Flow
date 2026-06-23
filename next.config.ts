import type { NextConfig } from "next";

function getBackendImageRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return [];
  }

  try {
    const backendUrl = new URL(apiUrl);

    return [
      {
        protocol: backendUrl.protocol.replace(":", "") as "http" | "https",
        hostname: backendUrl.hostname,
        port: backendUrl.port,
        pathname: "/uploads/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: getBackendImageRemotePatterns(),
  },
};

export default nextConfig;
