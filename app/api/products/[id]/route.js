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
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID Produk tidak valid" },
        { status: 400 },
      );
    }

    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        images: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || error },
      { status: 500 },
    );
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

    const rawCatId = formData.get("categorieId");
    const rawBrandId = formData.get("brandId");
    const categorieId =
      rawCatId && rawCatId !== "null" ? parseInt(rawCatId) : null;
    const brandId =
      rawBrandId && rawBrandId !== "null" ? parseInt(rawBrandId) : null;

    // 2. Persiapkan data gambar untuk validasi Joi
    const newFiles = formData.getAll("newImages");
    const existingImagesUrl = formData.getAll("keptImages");

    const newImageFileData = newFiles
      .filter((file) => typeof file === "object" && file.size > 0)
      .map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }));

    const existingImagesData = existingImagesUrl.map((url) => ({
      name: typeof url === "string" ? url.split("/").pop() : "image.jpg",
      size: 1024,
      type: "image/jpeg",
    }));

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

    const { published: pub, ...dataToValidate } = body;

    const { error } = productValidation(dataToValidate);

    if (error) {
      const formattedErrors = {};
      error.details.forEach((detail) => {
        formattedErrors[detail.path[0]] = detail.message;
      });
      return NextResponse.json({ error: formattedErrors }, { status: 422 });
    }

    // ==========================================
    // 4. UPLOAD GAMBAR BARU KE CLOUDINARY
    // ==========================================
    const validNewFiles = newFiles.filter(
      (file) => typeof file === "object" && file.size > 0,
    );

    let uploadedImageRecords = [];

    if (validNewFiles.length > 0) {
      const uploadPromises = validNewFiles.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: `products/${id}` },
            (err, result) => {
              if (err) reject(err);
              else resolve(result.secure_url);
            },
          );
          uploadStream.end(buffer);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      uploadedImageRecords = uploadedUrls.map((url) => ({
        name: url, // Simpan URL Cloudinary lengkap
      }));
    }

    // 5. Update database
    const { images, ...productData } = body;

    const updatedProduct = await prisma.products.update({
      where: { id: parseInt(id) },
      data: {
        ...productData,
        // Prisma membuat baris baru di tabel images untuk URL gambar baru
        images: {
          create: uploadedImageRecords,
        },
      },
    });

    return NextResponse.json(
      { message: "Sukses", data: updatedProduct },
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
    const productId = parseInt(id);

    // 1. Ambil data produk beserta daftar gambarnya
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan di database" },
        { status: 404 },
      );
    }

    // 2. Hapus semua gambar terkait dari Cloudinary
    if (existingProduct.images && existingProduct.images.length > 0) {
      const deletePromises = existingProduct.images.map(async (img) => {
        const publicId = getCloudinaryPublicId(img.name);
        if (publicId) {
          return cloudinary.uploader.destroy(publicId);
        }
      });

      await Promise.all(deletePromises);

      // Opsional: Hapus folder tempat gambar produk disimpan di Cloudinary
      try {
        await cloudinary.api.delete_folder(`products/${productId}`);
      } catch (e) {
        // Abaikan jika folder sudah kosong atau otomatis terhapus
      }
    }

    // 3. Hapus data produk dari Database
    // Relasi Cascade akan menghapus baris di tabel 'images' secara otomatis
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
