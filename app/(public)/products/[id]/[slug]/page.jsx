import { cache } from "react";
import Custom404 from "@/app/404";
import ProductDetail from "@/components/ProductDetail";
import prisma from "@/lib/prisma";

// Satu sumber data untuk generateMetadata dan page.
// cache() membuat query hanya jalan sekali per request.
const getPublishedProduct = cache(async (id) => {
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) return null;

  return prisma.products.findFirst({
    where: { id: productId, published: true },
    include: {
      images: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getPublishedProduct(id);

  if (!product) {
    return {
      title: "Produk tidak ditemukan | PStore",
      robots: { index: false, follow: false },
    };
  }

  // Bersihkan meta description (metaDescription dulu, fallback ke description)
  const description = (product.metaDescription || product.description || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  // Ambil URL gambar pertama untuk Open Graph preview
  const imageUrl = product.images?.[0]?.name;
  const ogImages = imageUrl
    ? [{ url: imageUrl, width: 800, height: 800, alt: product.name }]
    : [];

  return {
    title: `${product.name} | PStore`,
    description,
    keywords: product.metaKeywords || product.tag || product.name,
    // Open Graph (preview saat link di-share ke WA, Facebook, LinkedIn, dll)
    openGraph: {
      title: product.name,
      description,
      type: "article",
      images: ogImages,
    },
    // Twitter Card
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getPublishedProduct(id);

  // notFound() mengirim status HTTP 404 sungguhan (bukan soft 404)
  // dan memakai app/not-found.jsx untuk tampilannya.
  if (!product) return <Custom404 />;

  return (
    <main className="bg-white py-6">
      <ProductDetail product={product} />
    </main>
  );
}
