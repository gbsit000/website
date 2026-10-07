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
          src={`${process.env.IMAGE_BASE_URL}/banners/${image}`}
          width={1200} // Angka bebas, hanya sebagai acuan rasio asli gambar
          height={600}
          sizes="100vw"
          loading="eager"
          alt="TRIPLE RICH PRODUCTION"
        />
      ))}
    </Carousel>
  );
}
