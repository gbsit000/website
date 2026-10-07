import ProductPagination from "@/components/ProductPagination";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma"; // 1. Tambahkan import Prisma Client

function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

// 2. Fungsi fetchProducts DIHAPUS karena tidak lagi diperlukan

export default async function CategoryPage({ params, searchParams }) {
  const { id, slug } = await params;
  const sParam = await searchParams;

  const page = parseInt(sParam?.page || "1", 10);
  const limit = parseInt(sParam?.limit || "20", 10);
  const query = sParam?.q || "";

  // 3. Logika skip untuk paginasi (diambil dari route_3.js)
  const skip = (page - 1) * limit;

  // 4. Kondisi pencarian (diambil dari route_3.js)
  const whereCondition = {
    name: {
      contains: query,
    },
    categorieId: parseInt(id), // Filter berdasarkan kategori dari URL
    published: true, // Hanya tampilkan produk yang dipublikasi
  };

  // 5. Eksekusi database langsung menggunakan Prisma
  const [products, totalProduct] = await prisma.$transaction([
    prisma.products.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.products.count({
      where: whereCondition,
    }),
  ]);

  return (
    <div style={{ padding: "24px" }} className="bg-gray-50">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold capitalize tracking-tight text-gray-900">
          Katalog Produk {slug}
        </h2>

        {/* Grid Layout: 1 Kolom (Mobile), 2 Kolom (Tablet), 3-4 Kolom (Desktop) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.id}/${slugify(item.name)}`}
              className="w-full block text-center text-xs font-medium text-white transition-colors"
            >
              <ProductCard key={item.id} product={item} />
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Komponen Antd Pagination (Client Component) */}
      <ProductPagination total={totalProduct} page={page} limit={limit} />
    </div>
  );
}
