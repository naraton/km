import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    /* "192.168.61.168", */
  ],
};

export default nextConfig;