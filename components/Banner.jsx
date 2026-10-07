import { Carousel } from "antd";
import Image from "next/image";
import prisma from "@/lib/prisma";

export default async function Banner() {
  const banners = await prisma.banners.findMany({
    where: {
      published: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Helper untuk menentukan URL gambar banner yang valid
  const getBannerUrl = (imageName) => {
    if (!imageName) return "/placeholder-banner.png"; // Fallback jika image null

    // 1. Jika URL Cloudinary / Hosting eksternal (http/https)
    if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
      return imageName;
    }

    // 2. Jika file lokal lama
    const baseUrl = process.env.IMAGE_BASE_URL || "";
    return `${baseUrl}/banners/${imageName}`;
  };

  return (
    <Carousel
      arrows
      draggable
      autoplay
      config={{
        arrowSize: "132",
      }}
    >
      {banners.map(({ id, image }) => (
        <Image
          className="rounded-2xl"
          key={id}
          src={getBannerUrl(image)}
          width={1200}
          height={600}
          sizes="100vw"
          loading="eager"
          alt="TRIPLE RICH PRODUCTION"
        />
      ))}
    </Carousel>
  );
}
