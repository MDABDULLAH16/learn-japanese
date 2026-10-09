import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['kuroshiro', 'kuroshiro-analyzer-kuromoji', 'kuromoji'],
    outputFileTracingIncludes: {
      '/**': ['./node_modules/kuromoji/dict/**/*'],
    }
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
