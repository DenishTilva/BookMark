/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Disable persistent cache to fix serialization warning
    config.cache = false;
    return config;
  },
  experimental: {
    ssr: true,
  },
};

export default nextConfig;

