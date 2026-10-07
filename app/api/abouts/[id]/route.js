import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aboutValidation } from "@/validation/aboutValidation";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { error } = aboutValidation(body);

    if (error) {
      const formattedErrors = {};
      error.details.forEach((detail) => {
        formattedErrors[detail.path[0]] = detail.message;
      });
      return NextResponse.json({ error: formattedErrors }, { status: 422 });
    }

    const updatedAbout = await prisma.abouts.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        email: body.email,
        phone: body.phone,
        address: body.address,
        description: body.description,
        published: body.published,
      },
    });

    return NextResponse.json(
      { message: "Data berhasil diperbarui", data: updatedAbout },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui data" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.abouts.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json(
      { message: "Data berhasil dihapus" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus data" },
      { status: 500 },
    );
  }
}
