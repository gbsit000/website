import ProductPagination from "@/components/ProductPagination";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { prisma } from "@/lib/prisma"; // 1. Import Prisma Client Anda

function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Ganti spasi dengan -
    .replace(/[^\w\-]+/g, "") // Hapus karakter khusus non-alphanumeric
    .replace(/\-\-+/g, "-"); // Ganti multiple - dengan single -
}

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params?.page || "1", 10);
  const limit = parseInt(params?.limit || "20", 10);
  const query = params?.q || "";

  // 2. Hitung offset (skip) untuk paginasi
  const skip = (page - 1) * limit;

  // 3. Buat kondisi pencarian (disalin dari route.js)
  const whereCondition = {
    name: {
      contains: query,
    },
    published: true, // Pastikan hanya menampilkan produk yang dipublish
  };

  // 4. Panggil database langsung menggunakan Prisma
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
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900">
          Katalog Produk
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
