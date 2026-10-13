import { NextResponse } from "next/server";
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// Query daftar brand (dipisah supaya bisa dibungkus cache)
async function fetchBrands({ query, page, limit }) {
  const skip = (page - 1) * limit;

  const whereCondition = {
    name: { contains: query },
  };

  const [brands, total] = await prisma.$transaction([
    prisma.brands.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.brands.count({
      where: whereCondition,
    }),
  ]);

  return { data: brands, total: total };
}

// Versi ber-cache: disimpan 1 jam, atau sampai revalidateTag("brands") dipanggil.
// Brand jarang berubah, jadi aman disimpan lebih lama.
const getCachedBrands = unstable_cache(fetchBrands, ["brands-list"], {
  tags: ["brands"],
  revalidate: 3600,
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const params = { query, page, limit };

    // Pencarian selalu ambil data langsung (kata kuncinya terlalu beragam).
    // Daftar tanpa pencarian (mis. dropdown brand) dilayani dari cache.
    const result = query
      ? await fetchBrands(params)
      : await getCachedBrands(params);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, published } = body;

    const newBrand = await prisma.brands.create({
      data: {
        name: name,
        published: published ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Data berubah -> hapus cache daftar brand
    revalidateTag("brands");

    return NextResponse.json(
      { message: "Brand berhasil dibuat", data: newBrand },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
