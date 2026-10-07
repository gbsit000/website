import Image from "next/image";

export default function ProductCard({ product }) {
  // Mengambil gambar pertama dari array images
  const primaryImage = product?.images?.[0];

  // Helper untuk menentukan URL gambar yang valid
  const getProductImageUrl = (image, productId) => {
    // 1. Jika tidak ada gambar/nama gambar kosong
    if (!image) return "/600x400.svg";

    // Ambil string nama/URL file (tergantung struktur object primaryImage kamu)
    const imageName = typeof image === "object" ? image.name : image;

    if (!imageName) return "/600x400.svg";

    // 2. Jika sudah berupa URL lengkap Cloudinary / Hosting (http/https)
    if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
      return imageName;
    }

    // 3. Jika masih berupa file lokal lama
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "";
    return `${baseUrl}/item/${productId}/${imageName}`;
  };

  const imageUrl = getProductImageUrl(primaryImage, product?.id);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      {/* Container Gambar */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={product?.name || "Produk"}
          fill
          loading="eager"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Konten Informasi Produk */}
      <div className="flex flex-1 flex-col p-4">
        {/* Nama Produk */}
        <h3 className="line-clamp-1 text-base font-semibold text-gray-900 group-hover:text-blue-600">
          {product?.name}
        </h3>
        {/* Tombol Aksi */}
        <div className="mt-4 block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800">
          Lihat Detail
        </div>
      </div>
    </div>
  );
}
