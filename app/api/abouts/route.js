import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aboutValidation } from "@/validation/aboutValidation";

export async function GET() {
  try {
    const abouts = await prisma.abouts.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: abouts }, { status: 200 });
  } catch (error) {
    console.log("Error fetching abouts:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { error } = aboutValidation(body);

    if (error) {
      const formattedErrors = {};
      error.details.forEach((detail) => {
        formattedErrors[detail.path[0]] = detail.message;
      });
      return NextResponse.json({ error: formattedErrors }, { status: 422 });
    }

    const about = await prisma.abouts.create({
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
      { message: "Data berhasil ditambahkan", data: about },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating about:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
