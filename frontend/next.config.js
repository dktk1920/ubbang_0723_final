const path = require("path")

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: ["https://192.168.0.39:3000"],  // ✅ 요 줄 추가!
  },
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname)
    return config
  },
}

module.exports = nextConfig
