import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Footer() {
  const employees = await prisma.employees.findMany({
    where: {
      published: true,
    },
    orderBy: { id: "desc" },
    include: { roleData: true }, // Menarik relasi nama role
  });

  return (
    <footer className="border-t border-gray-800 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Kolom 1: Profil Perusahaan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                P
              </span>
              <span className="text-xl font-bold text-white">PStore</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              Penyedia solusi kebutuhan produk industri berkualitas tinggi
              dengan layanan cepat dan terpercaya.
            </p>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Navigasi Utama
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="transition-colors hover:text-white"
                >
                  Katalog Produk
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-white"
                >
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3 & 4: Kontak Tim / Sales (Data Dinamis dari Database Employees) */}
          <div className="sm:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Hubungi Tim Kami
            </h3>

            {employees.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {employees.map((emp) => {
                  // Format nomor WA untuk link wa.me
                  const cleanPhone = emp.phone
                    ? emp.phone.replace(/[^0-9]/g, "")
                    : "";

                  return (
                    <div
                      key={emp.id}
                      className="rounded-xl border border-gray-800 bg-gray-800/40 p-3.5 transition-colors hover:border-gray-700"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white">
                          {emp.name || "Staf Layanan"}
                        </p>

                        {/* Label Role dari relasi roleData */}
                        {emp.roleData?.name && (
                          <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] font-medium text-blue-300">
                            {emp.roleData.name}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1 text-xs text-gray-400">
                        {emp.phone && (
                          <p className="flex items-center gap-1.5">
                            <span className="text-gray-500">WA:</span>
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-400 hover:underline"
                            >
                              {emp.phone}
                            </a>
                          </p>
                        )}

                        {emp.email && (
                          <p className="flex items-center gap-1.5 truncate">
                            <span className="text-gray-500">Email:</span>
                            <a
                              href={`mailto:${emp.email}`}
                              className="truncate hover:text-white"
                            >
                              {emp.email}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-xs text-gray-500">
                Informasi kontak belum tersedia.
              </p>
            )}
          </div>
        </div>

        {/* Hak Cipta */}
        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} PStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
