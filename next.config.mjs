/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      "/api/generate": ["./templates/**/*"],
      "/api/download/[id]": ["./templates/**/*"],
    },
  },
};

export default nextConfig;
