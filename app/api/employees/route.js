import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { employessVAlidation } from "@/validation/employess";
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const whereCondition = {
      name: { contains: query },
    };

    const [employees, total] = await prisma.$transaction([
      prisma.employees.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: { id: "desc" },
        include: { roleData: true }, // Menarik relasi nama role
      }),
      prisma.employees.count({
        where: whereCondition,
      }),
    ]);

    return NextResponse.json(
      { data: employees, total: total },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, role_id, published } = body;
    const { error } = employessVAlidation(body);
    if (error) {
      // Siapkan object kosong
      const err = {};
      // Isi object tersebut menggunakan forEach
      error.details.forEach((detail) => {
        // detail.path[0] berisi nama field (misal: 'name' atau 'email')
        err[detail.path[0]] = detail.message;
      });

      return NextResponse.json({ error: err }, { status: 422 });
    }
    const newEmploye = await prisma.employees.create({
      data: {
        name,
        email,
        phone,
        published,
        role_id: role_id ? parseInt(role_id) : null,
      },
    });

    return NextResponse.json(
      { message: "Karyawan berhasil dibuat", data: newEmploye, success: true },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
