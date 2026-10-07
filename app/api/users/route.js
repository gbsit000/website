import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userValidation } from "@/validation/userValidation";
import bcrypt from "bcryptjs"; // Import bcrypt untuk enkripsi

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      // HANYA ambil data yang aman (jangan select password)
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        role: true, // Akan memunculkan data role (marketing, dll)
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: users }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data pengguna" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { error } = userValidation(body, false);

    if (error) {
      const formattedErrors = {};
      error.details.forEach((detail) => {
        formattedErrors[detail.path[0]] = detail.message;
      });
      return NextResponse.json({ error: formattedErrors }, { status: 422 });
    }

    // 1. Cek apakah email sudah terdaftar
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ email: body.email }, { username: body.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === body.email) {
        return NextResponse.json(
          { error: { email: "Email sudah terdaftar" } },
          { status: 409 },
        );
      }
      if (existingUser.username === body.username) {
        return NextResponse.json(
          { error: { username: "Username sudah dipakai, pilih yang lain" } },
          { status: 409 },
        );
      }
    }

    // 2. Hash Password (Enkripsi)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    // 3. Simpan ke database
    const newUser = await prisma.users.create({
      data: {
        name: body.name,
        username: body.username,
        email: body.email,
        password: hashedPassword,
        roleId: parseInt(body.roleId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true, // Kembalikan tanpa password
      },
    });

    return NextResponse.json(
      { message: "Pengguna berhasil ditambahkan", data: newUser },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
