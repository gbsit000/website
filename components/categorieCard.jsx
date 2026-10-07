import Image from "next/image";
import { prisma } from "@/lib/prisma"; // 1. Tambahkan import Prisma Client

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

export default async function CategorieCard() {
  // 2. Ganti blok fetch dengan panggilan langsung ke Prisma
  // Berdasarkan API Anda, jika tidak ada parameter, maka: published = true, limit = 20
  const data = await prisma.categories.findMany({
    where: {
      published: true,
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 md:text-3xl">
          Kategori Produk
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5">
        {data.map((category) => {
          // Buat variabel helper untuk menentukan URL gambar yang valid
          const getImageUrl = (image, id) => {
            if (!image) return "/placeholder.png"; // Fallback jika image null/kosong
            if (image.startsWith("http://") || image.startsWith("https://")) {
              return image; // Jika URL Cloudinary
            }
            return `/images/categorie/${id}/${image}`; // Jika file lokal lama
          };

          return (
            <a
              key={category.id}
              href={`/categorie/${category.id}/${slugify(category.name)}`}
              className="group relative flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={getImageUrl(category.image, category.id)}
                  alt={category.name || "Kategori"}
                  fill
                  sizes="(max-width: 768px) 45vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="line-clamp-2 text-center text-sm font-medium text-slate-700 group-hover:text-blue-600 md:text-base">
                {category.name}
              </h3>
            </a>
          );
        })}
      </div>
    </section>
  );
}
