import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userValidation } from "@/validation/userValidation";
import bcrypt from "bcryptjs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Parameter kedua "true" menandakan ini adalah update (password opsional)
    const { error } = userValidation(body, true);

    if (error) {
      const formattedErrors = {};
      error.details.forEach((detail) => {
        formattedErrors[detail.path[0]] = detail.message;
      });
      return NextResponse.json({ error: formattedErrors }, { status: 422 });
    }

    // 1. Cek apakah email bentrok dengan user lain
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ email: body.email }, { username: body.username }],
        NOT: {
          id: parseInt(id), // Kecualikan user yang sedang diedit ini
        },
      },
    });

    if (existingUser) {
      if (existingUser.email === body.email) {
        return NextResponse.json(
          { error: { email: "Email sudah dipakai pengguna lain" } },
          { status: 409 },
        );
      }
      if (existingUser.username === body.username) {
        return NextResponse.json(
          { error: { username: "Username sudah dipakai pengguna lain" } },
          { status: 409 },
        );
      }
    }

    // 2. Siapkan data yang mau diupdate
    const dataToUpdate = {
      name: body.name,
      username: body.username,
      email: body.email,
      roleId: parseInt(body.roleId),
    };

    // 3. Jika pengguna mengisi password baru, hash dan update. Jika tidak, abaikan.
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.password = await bcrypt.hash(body.password, salt);
    }

    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, roleId: true },
    });

    return NextResponse.json(
      { message: "Data pengguna berhasil diperbarui", data: updatedUser },
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

    await prisma.users.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Pengguna berhasil dihapus" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus data" },
      { status: 500 },
    );
  }
}
