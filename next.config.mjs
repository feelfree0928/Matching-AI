/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const base =
      process.env.NEXT_PUBLIC_API_BASE ?? "http://74.161.162.184:8000";
    return [{ source: "/proxy/:path*", destination: `${base}/:path*` }];
  },
};

export default nextConfig;
