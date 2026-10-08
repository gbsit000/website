import { NextResponse } from "next/server";
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
    pathAfterUpload.shift(); // Hapus versi (misal: v123456789)
  }

  const fullPath = pathAfterUpload.join("/");
  return fullPath.substring(0, fullPath.lastIndexOf("."));
};

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const imageId = parseInt(id);

    // 1. Cari data gambar di database berdasarkan ID image tersebut
    const imageRecord = await prisma.images.findUnique({
      where: { id: imageId },
    });

    if (!imageRecord) {
      return NextResponse.json(
        { error: "Gambar tidak ditemukan di database" },
        { status: 404 },
      );
    }

    // 2. Hapus gambar dari Cloudinary jika URL-nya ada
    if (imageRecord.name) {
      const publicId = getCloudinaryPublicId(imageRecord.name);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // 3. Hapus record gambar dari database menggunakan Prisma
    await prisma.images.delete({
      where: { id: imageId },
    });

    return NextResponse.json(
      { message: "Gambar berhasil dihapus dari Cloudinary dan database" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
