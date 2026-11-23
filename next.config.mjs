/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["isomorphic-dompurify"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dodgerblue-dog-671224.hostingersite.com",
        port: "",
        pathname: "/**", // Mengizinkan semua folder gambar di domain ini
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    cpus: 2,
    workerThreads: false,
  },
};

export default nextConfig;
