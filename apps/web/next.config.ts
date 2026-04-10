import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => [
    {
      source: "/api/cms/:path*",
      destination: `${process.env.MEDIACMS_URL || "http://localhost"}/api/v1/:path*`,
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "80",
      },
    ],
  },
};

export default nextConfig;
