import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientVendorValidation } from "@/validation/clientVendorValidation";

export async function GET() {
  try {
    const clients = await prisma.clients.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: clients }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { error } = clientVendorValidation(body);

    if (error) {
      const formattedErrors = {};
      error.details.forEach((detail) => {
        formattedErrors[detail.path[0]] = detail.message;
      });
      return NextResponse.json({ error: formattedErrors }, { status: 422 });
    }

    const client = await prisma.clients.create({
      data: {
        name: body.name,
        address: body.address,
        contact: body.contact,
        email: body.email,
      },
    });

    return NextResponse.json(
      { message: "Data berhasil ditambahkan", data: client },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
