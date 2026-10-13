import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper untuk mengekstrak public_id dari URL Cloudinary
const getCloudinaryPublicId = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;

  const pathAfterUpload = parts.slice(uploadIndex + 1);
  if (pathAfterUpload[0].startsWith("v")) {
    pathAfterUpload.shift();
  }

  const fullPath = pathAfterUpload.join("/");
  return fullPath.substring(0, fullPath.lastIndexOf("."));
};

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    const category = await prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: category }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    const formData = await request.formData();

    // 1. Ambil data dari request frontend
    const name = formData.get("name");
    const published = formData.get("published") === "true";
    const imageFile = formData.get("image"); // File gambar baru (jika ada)
    const deleteImage = formData.get("deleteImage") === "true"; // Flag jika gambar dihapus

    // 2. Cek apakah kategori ada di database
    const existingCategory = await prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 },
      );
    }

    let newImageUrl = existingCategory.image;

    // 3. Logika penanganan gambar Cloudinary
    if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
      // SKENARIO A: User mengunggah gambar baru

      // Hapus gambar lama dari Cloudinary jika ada
      if (existingCategory.image) {
        const publicId = getCloudinaryPublicId(existingCategory.image);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // Upload gambar baru ke Cloudinary
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      newImageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: `categories/${categoryId}` },
          (err, result) => {
            if (err) reject(err);
            else resolve(result.secure_url);
          },
        );
        uploadStream.end(buffer);
      });
    } else if (deleteImage) {
      // SKENARIO B: User menghapus gambar di form tanpa mengupload yang baru

      if (existingCategory.image) {
        const publicId = getCloudinaryPublicId(existingCategory.image);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      newImageUrl = null;
    }

    // 4. Update data ke database Prisma
    const updatedCategory = await prisma.categories.update({
      where: { id: categoryId },
      data: {
        name: name,
        published: published,
        image: newImageUrl, // Berisi URL Cloudinary baru, null, atau tetap URL lama
        updatedAt: new Date(),
      },
    });

    // Data berubah -> hapus cache daftar kategori
    revalidateTag("categories");

    return NextResponse.json(
      { message: "Kategori berhasil diperbarui", data: updatedCategory },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    const existingCategory = await prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 },
      );
    }

    // 1. Hapus gambar dari Cloudinary jika ada
    if (existingCategory.image) {
      const publicId = getCloudinaryPublicId(existingCategory.image);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // 2. Hapus data dari DB
    await prisma.categories.delete({ where: { id: categoryId } });

    // Kategori terhapus -> hapus cache daftar kategori
    revalidateTag("categories");

    return NextResponse.json(
      { message: "Kategori dan gambar berhasil dihapus" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
