import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling native Node.js modules
  serverExternalPackages: ['@lancedb/lancedb'],
};

export default nextConfig;
