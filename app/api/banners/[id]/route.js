import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bannerValidation } from "@/validation/bannerValidation";
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper untuk mengekstrak public_id dari URL Cloudinary
// Contoh URL: https://res.cloudinary.com/.../upload/v1234/banners/sample.jpg
// Hasil public_id: "banners/sample"
const getCloudinaryPublicId = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;

  // Ambil bagian path setelah versi (v1234567)
  const pathAfterUpload = parts.slice(uploadIndex + 1);
  if (pathAfterUpload[0].startsWith("v")) {
    pathAfterUpload.shift(); // hapus v1234567
  }

  const fullPath = pathAfterUpload.join("/"); // misal: "banners/sample.jpg"
  return fullPath.substring(0, fullPath.lastIndexOf(".")); // hapus ekstensi file (.jpg, .png, dll)
};

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const bannerId = parseInt(id);
    const formData = await request.formData();

    // 1. Ambil data
    const title = formData.get("title");
    const description = formData.get("description");
    const published = formData.get("published") === "true";
    const deleteImage = formData.get("deleteImage") === "true";
    const imageFile = formData.get("image");

    // 2. Persiapkan validasi
    let imageForValidation = undefined;
    if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
      imageForValidation = {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
      };
    } else {
      imageForValidation = {
        name: "dummy.jpg",
        size: 1024,
        type: "image/jpeg",
      };
    }

    const body = { title, description, published, image: imageForValidation };
    const { error } = bannerValidation(body);

    if (error) {
      const formattedErrors = {};
      error.details.forEach((detail) => {
        formattedErrors[detail.path[0]] = detail.message;
      });
      return NextResponse.json({ error: formattedErrors }, { status: 422 });
    }

    const dataToUpdate = { title, description, published };

    // 3. Cari data banner lama
    const existingBanner = await prisma.banners.findUnique({
      where: { id: bannerId },
    });

    const hasNewImage =
      imageFile && typeof imageFile === "object" && imageFile.size > 0;

    // 4. HAPUS GAMBAR LAMA DI CLOUDINARY jika ada gambar baru ATAU user hapus gambar
    if (
      existingBanner &&
      existingBanner.image &&
      (deleteImage || hasNewImage)
    ) {
      const publicId = getCloudinaryPublicId(existingBanner.image);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // 5. UPLOAD GAMBAR BARU KE CLOUDINARY (jika ada)
    if (hasNewImage) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "banners" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
        );
        uploadStream.end(buffer);
      });

      dataToUpdate.image = uploadResult.secure_url;
    } else if (deleteImage) {
      dataToUpdate.image = "";
    }

    // 6. Update database
    const updatedBanner = await prisma.banners.update({
      where: { id: bannerId },
      data: dataToUpdate,
    });

    return NextResponse.json(
      { message: "Banner berhasil diperbarui", data: updatedBanner },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || error },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const bannerId = parseInt(id);

    const existingBanner = await prisma.banners.findUnique({
      where: { id: bannerId },
    });

    if (!existingBanner) {
      return NextResponse.json(
        { error: "Banner tidak ditemukan" },
        { status: 404 },
      );
    }

    // Hapus file dari Cloudinary saat banner dihapus
    if (existingBanner.image) {
      const publicId = getCloudinaryPublicId(existingBanner.image);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await prisma.banners.delete({
      where: { id: bannerId },
    });

    return NextResponse.json(
      { message: "Banner dan gambarnya berhasil dihapus total" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || error },
      { status: 500 },
    );
  }
}
