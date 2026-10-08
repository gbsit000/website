import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; //
import { bannerValidation } from "@/validation/bannerValidation"; //
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary dari environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url); //
  try {
    const published = searchParams.get("published") === "true"; //
    const queryCondition = published ? { published: true } : {}; //[cite: 3]
    const banners = await prisma.banners.findMany({
      where: queryCondition,
      orderBy: { createdAt: "desc" },
    }); //[cite: 3]
    return NextResponse.json({ data: banners }, { status: 200 }); //[cite: 3]
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    ); //[cite: 3]
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData(); //[cite: 3]

    // 1. Ambil data teks
    const title = formData.get("title"); //[cite: 3]
    const description = formData.get("description"); //[cite: 3]
    const published = formData.get("published") === "true"; //[cite: 3]

    // 2. Ambil file gambar
    const imageFile = formData.get("image"); //[cite: 3]
    let imageForValidation = undefined; //[cite: 3]

    // Cek apakah file benar-benar ada dan berupa objek file
    if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
      imageForValidation = {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
      }; //[cite: 3]
    }

    const body = {
      title,
      description,
      published,
      image: imageForValidation,
    }; //[cite: 3]

    // 3. Jalankan validasi Joi
    const { error } = bannerValidation(body); //[cite: 3]

    if (error) {
      const formattedErrors = {};
      error.details.forEach((detail) => {
        formattedErrors[detail.path[0]] = detail.message;
      }); //[cite: 3]
      return NextResponse.json({ error: formattedErrors }, { status: 422 }); //[cite: 3]
    }

    // ==========================================
    // 4. UPLOAD GAMBAR KE CLOUDINARY
    // ==========================================
    let imageUrl = null;

    if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
      // Ubah file menjadi buffer
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Stream upload ke Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "banners" }, // Nama folder penyimpanan di Cloudinary
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
        );
        uploadStream.end(buffer);
      });

      // Simpan URL lengkap gambar (misal: https://res.cloudinary.com/...)
      imageUrl = uploadResult.secure_url;
    }

    // ==========================================
    // 5. Simpan ke database
    // ==========================================
    const banner = await prisma.banners.create({
      data: {
        title,
        description,
        published,
        image: imageUrl, // Masukkan URL secure dari Cloudinary
      },
    });

    return NextResponse.json(
      { message: "Banner berhasil ditambahkan", data: banner },
      { status: 201 },
    ); //[cite: 3]
  } catch (error) {
    return NextResponse.json(
      { error: error.message || error },
      { status: 500 },
    ); //[cite: 3]
  }
}
