import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bannerValidation } from "@/validation/bannerValidation";
import fs from "fs";
import path from "path";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const bannerId = parseInt(id);
    const formData = await request.formData();

    // 1. Ambil data
    const title = formData.get("title");
    const description = formData.get("description");
    const published = formData.get("published") === "true";
    const deleteImage = formData.get("deleteImage") === "true"; // Tangkap sinyal hapus
    const imageFile = formData.get("image");

    // 2. Persiapkan validasi (Abaikan image jika tidak ada gambar baru)
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

    // 3. Cari data banner lama untuk mendapatkan nama file
    const existingBanner = await prisma.banners.findUnique({
      where: { id: bannerId },
    });

    // 4. HAPUS FILE FISIK jika ada gambar baru ATAU user sengaja menghapus gambar
    if (
      existingBanner &&
      existingBanner.image &&
      (deleteImage || (imageFile && imageFile.size > 0))
    ) {
      const oldImagePath = path.join(
        process.cwd(),
        "public/images/banners",
        existingBanner.image,
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // File lokal dihapus di sini
      }
    }

    // 5. Tulis file gambar baru (jika ada) ke lokal
    if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/images/banners");
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(imageFile.name);
      const fileName = `${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fs.writeFileSync(filePath, buffer);

      dataToUpdate.image = fileName;
    } else if (deleteImage) {
      // Jika dihapus tanpa upload baru, kosongkan string di database
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
    return NextResponse.json({ error: error }, { status: 500 });
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

    // Hapus file fisik dari folder lokal saat tombol "Delete Banner" ditekan
    if (existingBanner.image) {
      const imagePath = path.join(
        process.cwd(),
        "public/images/banners",
        existingBanner.image,
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
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
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
