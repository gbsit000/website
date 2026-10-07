import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const roleId = parseInt(id);

    const role = await prisma.roles.findUnique({
      where: { id: roleId },
    });

    if (!role)
      return NextResponse.json(
        { error: "Role tidak ditemukan" },
        { status: 404 },
      );

    return NextResponse.json({ data: role }, { status: 200 });
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
    const roleId = parseInt(id);

    const body = await request.json();
    const { role } = body;

    const updatedRole = await prisma.roles.update({
      where: { id: roleId },
      data: {
        role: role,
      },
    });

    return NextResponse.json(
      { message: "Role diperbarui", data: updatedRole },
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
    const roleId = parseInt(id);

    await prisma.roles.delete({
      where: { id: roleId },
    });

    return NextResponse.json(
      { message: "Role berhasil dihapus" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
