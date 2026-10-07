import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productValidation } from "@/validation/productValidation";

import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
  try {
    // 1. Ambil ID dari URL parameter dan ubah ke tipe Number/Int
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID Produk tidak valid" },
        { status: 400 },
      );
    }

    // 2. Query ke database menggunakan findUnique
    const product = await prisma.products.findUnique({
      where: {
        id: productId,
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

    // 3. Jika produk tidak ditemukan
    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    // 4. Kembalikan data produk
    return NextResponse.json({
      data: product,
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    // 1. Ambil data teks
    const name = formData.get("name");
    const tag = formData.get("tag");
    const description = formData.get("description");
    const published = formData.get("published") === "true";
    const metaDescription = formData.get("metaDescription");
    const metaKeywords = formData.get("metaKeywords");

    // Parse foreign key
    const rawCatId = formData.get("categorieId");
    const rawBrandId = formData.get("brandId");
    const categorieId =
      rawCatId && rawCatId !== "null" ? parseInt(rawCatId) : null;
    const brandId =
      rawBrandId && rawBrandId !== "null" ? parseInt(rawBrandId) : null;

    // 2. Persiapkan data gambar untuk validasi Joi
    const newFiles = formData.getAll("newImages");
    const existingImagesUrl = formData.getAll("keptImages");

    // Ekstrak file fisik baru
    const newImageFileData = newFiles
      .filter((file) => typeof file === "object" && file.size > 0)
      .map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }));

    // Trik Validasi: Buat objek "dummy" untuk gambar lama agar lolos Joi
    const existingImagesData = existingImagesUrl.map((url) => ({
      name: path.basename(url),
      size: 1024,
      type: "image/jpeg",
    }));

    // Gabungkan gambar lama dan baru hanya untuk mengecek total keseluruhan (validasi)
    const combinedImages = [...existingImagesData, ...newImageFileData];

    // 3. Susun body utuh untuk divalidasi
    const body = {
      name,
      tag,
      description,
      published,
      metaDescription,
      metaKeywords,
      categorieId,
      brandId,
      images: combinedImages,
    };

    // Pisahkan 'published' khusus untuk Joi agar tidak error "not allowed"
    const { published: pub, ...dataToValidate } = body;

    // Jalankan validasi
    const { error } = productValidation(dataToValidate);

    // 4. Tangkap dan kirim error Joi (Status 422)
    if (error) {
      const formattedErrors = {};
      error.details.forEach((detail) => {
        formattedErrors[detail.path[0]] = detail.message;
      });
      return NextResponse.json({ error: formattedErrors }, { status: 422 });
    }

    // ==========================================
    // JIKA LOLOS VALIDASI, LANJUTKAN PROSES BACA/TULIS FILE
    // ==========================================

    const uploadDir = path.join(process.cwd(), `public/images/item/${id}`);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const processedImages = [];

    // Tulis file fisik baru ke folder
    for (const file of newFiles) {
      if (typeof file === "object" && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.name);
        const fileName = `${uniqueSuffix}${ext}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, buffer);

        // HANYA GAMBAR BARU yang dimasukkan ke array untuk database
        processedImages.push({ name: fileName });
      }
    }

    // 5. Update database
    // Ekstrak images agar array custom tidak ikut terkirim ke Prisma
    const { images, ...productData } = body;

    const updatedProduct = await prisma.products.update({
      where: { id: parseInt(id) },
      data: {
        ...productData,
        // Prisma HANYA akan membuat baris baru untuk gambar yang baru diunggah
        images: {
          create: processedImages.map((img) => ({
            name: img.name,
          })),
        },
      },
    });

    return NextResponse.json(
      { message: "Sukses", data: updatedProduct },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    // 1. Cek apakah produk ada di database, sekaligus ambil data gambarnya
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
      include: { images: true }, // Sertakan relasi images
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan di database" },
        { status: 404 },
      );
    }

    // 2. Hapus Folder Fisik beserta seluruh isi gambarnya di lokal
    // Path: public/images/item/[productId]
    const uploadDir = path.join(
      process.cwd(),
      `public/images/item/${productId}`,
    );

    // Mengecek apakah folder tersebut ada
    if (fs.existsSync(uploadDir)) {
      // Menghapus folder beserta seluruh file di dalamnya secara paksa (seperti rm -rf)
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }

    // 3. Hapus data produk dari Database
    // Catatan: Karena di schema Anda ada atribut @relation(..., onDelete: Cascade) pada tabel images,
    // maka ketika produk dihapus, baris data gambar yang terkait di tabel 'images' akan otomatis ikut terhapus!
    await prisma.products.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: "Produk beserta semua gambarnya berhasil dihapus total!" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
