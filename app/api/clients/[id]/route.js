import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientVendorValidation } from "@/validation/clientVendorValidation";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { error } = clientVendorValidation(body);

    if (error) {
      const formattedErrors = {};
      error.details.forEach((detail) => {
        formattedErrors[detail.path[0]] = detail.message;
      });
      return NextResponse.json({ error: formattedErrors }, { status: 422 });
    }

    const updatedClient = await prisma.clients.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        address: body.address,
        contact: body.contact,
        email: body.email,
      },
    });

    return NextResponse.json(
      { message: "Data berhasil diperbarui", data: updatedClient },
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
    await prisma.clients.delete({
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
