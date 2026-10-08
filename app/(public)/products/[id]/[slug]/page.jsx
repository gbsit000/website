import ProductDetail from "@/components/ProductDetail";
import prisma from "@/lib/prisma"; // 1. Import Prisma Client Anda
export async function generateMetadata({ params }) {
  const { id } = await params;

  const response = await fetch(`${process.env.BASE_URL}/api/products/${id}`);
  const { data } = await response.json();
  // Ambil URL gambar pertama untuk Open Graph preview
  const primaryImage = data.images?.[0];
  // Bersihkan meta description (gunakan metaDescription jika ada, fallback ke description)
  const rawDescription = data.metaDescription || data.description;

  return {
    title: `${data.name} | PStore`,
    description: rawDescription,
    keywords: data.metaKeywords || data.tag || data.name,
    // Open Graph (Tampilan preview saat link di-share ke WA, Facebook, LinkedIn, dll)
    openGraph: {
      title: data.name,
      description: rawDescription,
      type: "article",
      images: [
        {
          url: primaryImage.name,
          width: 800,
          height: 800,
          alt: data.name,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: data.name,
      description: rawDescription,
      images: [primaryImage.name],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  // Contoh data dari Prisma/Backend milikmu
  const { id } = await params;
  const product = await prisma.products.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      images: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return (
    <main className="bg-white py-6">
      <ProductDetail product={product} />
    </main>
  );
}
