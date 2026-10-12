import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
    minimumIdle: 0, // jangan menahan koneksi idle
    idleTimeout: 10, // detik; HARUS lebih kecil dari wait_timeout (20)
    connectTimeout: 10000,
    acquireTimeout: 20000, // beri waktu cukup saat membuat koneksi baru
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// simpan di global untuk semua environment, supaya tidak dibuat ulang
globalForPrisma.prisma = prisma;

export default prisma;
