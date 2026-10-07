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
    ],
  },
};

export default nextConfig;
