import Link from "next/link";

export const metadata = {
  title: "Halaman tidak ditemukan",
};

export default function Custom404() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6 py-16 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div className="w-full max-w-xl">
        {/* Kotak kosong: produk yang tidak ada */}
        <div
          aria-hidden="true"
          className="relative mb-10 flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700"
        >
          <span className="select-none text-6xl font-black tracking-tighter text-stone-300 dark:text-stone-700">
            404
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Halaman atau produk tidak ditemukan
        </h1>

        <p className="mt-4 max-w-md text-base leading-relaxed text-stone-600 dark:text-stone-400">
          Alamat yang Anda buka salah, atau produknya sudah tidak aktif atau
          dihapus. Periksa kembali tautannya, atau kembali ke halaman utama.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300 dark:focus-visible:ring-stone-100 dark:focus-visible:ring-offset-stone-950"
          >
            Kembali ke beranda
          </Link>
          <Link
            href="/products"
            className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-900 dark:focus-visible:ring-stone-100 dark:focus-visible:ring-offset-stone-950"
          >
            Lihat semua produk
          </Link>
        </div>
      </div>
    </main>
  );
}
