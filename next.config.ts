import type { NextConfig } from "next";

function getUploadRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const origins = [
    process.env.NEXT_PUBLIC_API_ORIGIN,
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, ""),
    process.env.NODE_ENV === "development" ? "http://localhost:3001" : "",
  ].filter((origin): origin is string => Boolean(origin));

  return origins.flatMap((origin) => {
    try {
      const url = new URL(origin);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return [];
      }

      return [
        {
          protocol: url.protocol.replace(":", "") as "http" | "https",
          hostname: url.hostname,
          port: url.port,
          pathname: "/uploads/**",
        },
      ];
    } catch {
      return [];
    }
  });
}

const nextConfig: NextConfig = {
<<<<<<< HEAD
=======
  images: {
    qualities: [75, 100],
    remotePatterns: getUploadRemotePatterns(),
  },
>>>>>>> Dulnith
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    const localApiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

    return [
      {
        source: "/backend/:path*",
        destination: `${localApiUrl.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
