import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const brandId = parseInt(id);

    const brand = await prisma.brands.findUnique({
      where: { id: brandId },
    });

    if (!brand)
      return NextResponse.json(
        { error: "Brand tidak ditemukan" },
        { status: 404 },
      );

    return NextResponse.json({ data: brand }, { status: 200 });
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
    const brandId = parseInt(id);
    const body = await request.json();
    const { name, published } = body;

    const updatedBrand = await prisma.brands.update({
      where: { id: brandId },
      data: {
        name: name,
        published: published,
        updatedAt: new Date(),
      },
    });

    // Data berubah -> hapus cache daftar brand
    revalidateTag("brands");

    return NextResponse.json(
      { message: "Brand diperbarui", data: updatedBrand },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const brandId = parseInt(id);

    await prisma.brands.delete({
      where: { id: brandId },
    });

    // Brand terhapus -> hapus cache daftar brand
    revalidateTag("brands");

    return NextResponse.json(
      { message: "Brand berhasil dihapus" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
