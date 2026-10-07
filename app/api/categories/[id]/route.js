import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

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

    let newImageName = existingCategory.image;
    const uploadDir = path.join(
      process.cwd(),
      `public/images/item-category/${categoryId}`,
    );

    // 3. Logika penanganan file fisik gambar
    if (imageFile && typeof imageFile === "object" && imageFile.name) {
      // SKENARIO A: User mengunggah gambar baru

      // Hapus gambar lama secara fisik (jika sebelumnya punya gambar)
      if (existingCategory.image) {
        const oldImagePath = path.join(uploadDir, existingCategory.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Pastikan folder ada
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate nama file baru & simpan
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(imageFile.name);

      newImageName = `${uniqueSuffix}${ext}`;
      const newFilePath = path.join(uploadDir, newImageName);

      fs.writeFileSync(newFilePath, buffer);
    } else if (deleteImage) {
      // SKENARIO B: User menghapus gambar di form tanpa mengupload yang baru

      if (existingCategory.image) {
        const oldImagePath = path.join(uploadDir, existingCategory.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Kosongkan nama gambar untuk database
      newImageName = null;
    }

    // 4. Update data ke database Prisma
    const updatedCategory = await prisma.categories.update({
      where: { id: categoryId },
      data: {
        name: name,
        published: published,
        image: newImageName, // Bisa berisi nama file baru, null, atau tetap nama lama
        updatedAt: new Date(),
      },
    });

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

    // Hapus paksa folder ID beserta isinya
    const uploadDir = path.join(
      process.cwd(),
      `public/images/item-category/${categoryId}`,
    );
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }

    // Hapus data dari DB
    await prisma.categories.delete({ where: { id: categoryId } });

    return NextResponse.json(
      { message: "Kategori dan gambar terhapus" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
