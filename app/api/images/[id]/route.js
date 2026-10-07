import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

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
    // 2. Hapus file fisik dari folder public
    // Asumsi path foldernya: public/images/item/[productsId]/[nama_file]

    if (imageRecord.productId && imageRecord.name) {
      const filePath = path.join(
        process.cwd(),
        `public/images/item/${imageRecord.productId}/${imageRecord.name}`,
      );
      // Cek apakah file fisiknya ada, lalu hapus
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3. Hapus record dari database menggunakan Prisma
    await prisma.images.delete({
      where: { id: imageId },
    });

    return NextResponse.json(
      { message: "Gambar berhasil dihapus dari database dan lokal" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
