import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const whereCondition = {
      role: { contains: query },
    };

    const [roles, total] = await prisma.$transaction([
      prisma.roles.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.roles.count({
        where: whereCondition,
      }),
    ]);

    return NextResponse.json({ data: roles, total: total }, { status: 200 });
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
    const { role } = body;

    const newRole = await prisma.roles.create({
      data: {
        role: role,
      },
    });

    return NextResponse.json(
      { message: "Role berhasil dibuat", data: newRole },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
