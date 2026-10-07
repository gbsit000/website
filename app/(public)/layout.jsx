import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Your TRIPLE RICH PRODUCTION",
  description: "Your TRIPLE RICH PRODUCTION",
  keywords: "Your TRIPLE RICH PRODUCTION, Your TRIPLE RICH PRODUCTION",
};

export default function RootLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
