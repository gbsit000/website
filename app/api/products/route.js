import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productValidation } from "@/validation/productValidation";
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET: /api/Products
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  try {
    const categoryId = searchParams.get("categoryId");
    const isDashboard = searchParams.get("isDashboard") === "true";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const queryCondition = {};
    if (categoryId && categoryId !== "all") {
      queryCondition.categorieId = parseInt(categoryId);
    }

    const whereCondition = {
      name: {
        contains: query,
      },
      ...queryCondition,
    };

    if (!isDashboard) {
      whereCondition.published = true;
    }

    const [products, totalProduct] = await prisma.$transaction([
      prisma.products.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          images: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.products.count({
        where: whereCondition,
      }),
    ]);

    return NextResponse.json({
      products,
      totalProduct,
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: /api/Products
export async function POST(request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name");
    const tag = formData.get("tag");
    const description = formData.get("description");
    const published = formData.get("published") === "true";
    const metaDescription = formData.get("metaDescription");
    const metaKeywords = formData.get("metaKeywords");
    const categorieId = formData.get("categorieId");
    const brandId = formData.get("brandId");
    const rawFiles = formData.getAll("images");

    const imageFileData = rawFiles
      .filter((file) => typeof file === "object" && file.size > 0)
      .map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }));

    const body = {
      name,
      tag,
      description,
      metaDescription,
      published,
      metaKeywords,
      categorieId: categorieId ? parseInt(categorieId) : null,
      brandId: brandId ? parseInt(brandId) : null,
      images: imageFileData,
    };

    const { images, ...productData } = body;

    const { error } = productValidation(body);
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

    // 1. Simpan produk ke database terlebih dahulu untuk mendapatkan ID produk
    const newProduct = await prisma.products.create({
      data: { ...productData },
    });

    // 2. Upload file gambar ke Cloudinary secara paralel (jika ada)
    const validFiles = rawFiles.filter(
      (file) => typeof file === "object" && file.size > 0,
    );

    if (validFiles.length > 0) {
      const uploadPromises = validFiles.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: `products/${newProduct.id}` },
            (err, result) => {
              if (err) reject(err);
              else resolve(result.secure_url);
            },
          );
          uploadStream.end(buffer);
        });
      });

      // Tunggu seluruh proses upload gambar ke Cloudinary selesai
      const uploadedUrls = await Promise.all(uploadPromises);

      // 3. Simpan URL Cloudinary ke tabel relasi 'images'
      const imageRecords = uploadedUrls.map((url) => ({
        name: url, // Menyimpan secure_url dari Cloudinary di kolom 'name'
        productId: newProduct.id,
      }));

      await prisma.images.createMany({
        data: imageRecords,
      });
    }

    return NextResponse.json(
      { message: "Produk berhasil dibuat", data: newProduct },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
