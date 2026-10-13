import { NextResponse } from "next/server";
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { categorieValidation } from "@/validation/categorieValidation";
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Query daftar kategori (dipisah supaya bisa dibungkus cache)
async function fetchCategories({ query, page, limit, isDashboard }) {
  const skip = (page - 1) * limit;

  const whereCondition = {
    name: { contains: query },
  };
  if (!isDashboard) {
    whereCondition.published = true;
  }

  const [categories, total] = await prisma.$transaction([
    prisma.categories.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.categories.count({
      where: whereCondition,
    }),
  ]);

  return { data: categories, total: total };
}

// Versi ber-cache: disimpan 1 jam, atau sampai revalidateTag("categories") dipanggil.
const getCachedCategories = unstable_cache(
  fetchCategories,
  ["categories-list"],
  { tags: ["categories"], revalidate: 3600 },
);

// ==========================================
// 1. GET: Mengambil Data Kategori (dengan Search & Pagination)
// ==========================================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  try {
    const isDashboard = searchParams.get("isDashboard") === "true";
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    const params = { query, page, limit, isDashboard };

    const result =
      isDashboard || query
        ? await fetchCategories(params)
        : await getCachedCategories(params);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("Error fetching categories:", error);
    return NextResponse.json(
      { error: error.message || error },
      { status: 500 },
    );
  }
}

// ==========================================
// 2. POST: Membuat Kategori & Upload Gambar ke Cloudinary
// ==========================================
export async function POST(request) {
  try {
    const formData = await request.formData();

    // Ambil data dari form
    const published = formData.get("published") === "true";
    const name = formData.get("name");

    // 1. Ambil HANYA SATU file menggunakan .get
    const imageFile = formData.get("image");
    let imageForValidation;

    // 2. Jika file ada dan merupakan objek (file fisik)
    if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
      imageForValidation = {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
      };
    }

    // 3. Susun body untuk validasi
    const body = {
      name: name,
      image: imageForValidation,
    };

    // 4. Validasi menggunakan Joi
    const { error } = categorieValidation(body);
    if (error) {
      const formattedErrors = {};
      error.details.forEach((detail) => {
        formattedErrors[detail.path[0]] = detail.message;
      });
      return NextResponse.json(
        {
          message: "Validasi gagal",
          error: formattedErrors,
        },
        { status: 422 },
      );
    }

    // TAHAP 1: Insert ke database HANYA data teks terlebih dahulu untuk mendapatkan ID kategori
    const newCategory = await prisma.categories.create({
      data: {
        name: name,
        published: published,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    let imageUrl = null;

    // TAHAP 2: Jika user mengupload gambar, upload ke Cloudinary ke folder khusus kategori
    if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload menggunakan stream ke Cloudinary
      imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: `categorie/${newCategory.id}` },
          (err, result) => {
            if (err) reject(err);
            else resolve(result.secure_url);
          },
        );
        uploadStream.end(buffer);
      });

      // Update baris database dengan menyimpan URL lengkap dari Cloudinary pada kolom 'image'
      await prisma.categories.update({
        where: { id: newCategory.id },
        data: {
          image: imageUrl,
          updatedAt: new Date(),
        },
      });
    }

    // Ambil data final untuk dikembalikan ke frontend
    const finalCategory = await prisma.categories.findUnique({
      where: { id: newCategory.id },
    });

    // Data berubah -> hapus cache daftar kategori
    revalidateTag("categories");

    return NextResponse.json(
      { message: "Kategori berhasil dibuat", data: finalCategory },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
