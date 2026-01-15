import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/metadata',
        destination: 'https://url-metadata-api.brogee9o9.workers.dev/api/metadata',
      },
      {
        source: '/api/og-image',
        destination: 'https://og-image-generator.brogee9o9.workers.dev/api/og',
      },
    ];
  },
};

export default nextConfig;
