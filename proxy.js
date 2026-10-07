import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // Nama fungsi diubah dari middleware menjadi proxy
  function proxy(req) {
    // Di sini Anda bisa menambahkan logika Role jika mau.
    // Contoh: req.nextauth.token.role === "marketing"
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Izinkan masuk jika ada token (sudah login)
    },
    pages: {
      signIn: "/login", // Jika belum login, lempar ke halaman ini
    },
  },
);

// Tentukan rute mana saja yang mau dilindungi
export const config = {
  matcher: [
    // "/dashboard/:path*",  // Melindungi semua rute di dalam folder dashboard
  ],
};
