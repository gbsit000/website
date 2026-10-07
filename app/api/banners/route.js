import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bannerValidation } from "@/validation/bannerValidation";
import fs from "fs";
import path from "path";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  try {
    const published = searchParams.get("published") === "true";
    const queryCondition = published ? { published: true } : {};
    const banners = await prisma.banners.findMany({
      where: queryCondition,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: banners }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    // 1. Ambil data teks
    const title = formData.get("title");
    const description = formData.get("description");
    const published = formData.get("published") === "true";

    // 2. Ambil file gambar
    const imageFile = formData.get("image");
    let imageForValidation = undefined;

    // Cek apakah file benar-benar ada dan berupa objek file
    if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
      imageForValidation = {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
      };
    }

    const body = {
      title,
      description,
      published,
      image: imageForValidation,
    };

    // 3. Jalankan validasi Joi
    const { error } = bannerValidation(body);

    if (error) {
      const formattedErrors = {};
      error.details.forEach((detail) => {
        formattedErrors[detail.path[0]] = detail.message;
      });
      return NextResponse.json({ error: formattedErrors }, { status: 422 });
    }

    // ==========================================
    // 4. JIKA LOLOS VALIDASI: Tulis file ke lokal
    // ==========================================

    const uploadDir = path.join(process.cwd(), "public/images/banners");

    // Buat folder jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Buat nama file unik dan path penyimpanannya
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(imageFile.name);
    const fileName = `${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // Ubah file menjadi buffer dan tulis ke folder
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    // ==========================================
    // 5. Simpan ke database
    // ==========================================

    const banner = await prisma.banners.create({
      data: {
        title,
        description,
        published,
        image: fileName, // Masukkan nama file unik yang baru saja dibuat
      },
    });

    return NextResponse.json(
      { message: "Banner berhasil ditambahkan", data: banner },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
