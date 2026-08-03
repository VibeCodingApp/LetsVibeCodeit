/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 't0.gstatic.com' },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
