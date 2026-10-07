"use client";

import { useState } from "react";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";

export default function ProductDetail({ product }) {
  const htmlBersih = DOMPurify.sanitize(product?.description || "");

  // State untuk gambar aktif di galeri
  const [selectedImage, setSelectedImage] = useState(
    product?.images?.[0] || null,
  );

  // State kuantitas pembelian
  const [quantity, setQuantity] = useState(1);

  const images = product?.images || [];

  const handleQuantity = (type) => {
    if (type === "dec" && quantity > 1) setQuantity(quantity - 1);
    if (type === "inc") setQuantity(quantity + 1);
  };

  // Helper untuk menentukan URL gambar yang valid (Cloudinary vs File Lokal)
  const getImageUrl = (imgObj) => {
    if (!imgObj) return "/600x400.svg";

    const imageName = typeof imgObj === "object" ? imgObj.name : imgObj;
    if (!imageName) return "/600x400.svg";

    // 1. Jika URL Cloudinary / Hosting (http/https)
    if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
      return imageName;
    }

    // 2. Jika path relatif lokal
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "";
    return `${baseUrl}/item/${product?.id}/${imageName}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. BAGIAN UTAMA (GALERI & INFORMASI UTAMA) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* --- KOLOM KIRI: GALERI GAMBAR --- */}
        <div className="flex flex-col gap-4">
          {/* Gambar Utama Large */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
            {selectedImage ? (
              <Image
                src={getImageUrl(selectedImage)}
                alt={product?.name || "Gambar Produk"}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Tidak ada gambar
              </div>
            )}
          </div>

          {/* Thumbnail Selector (Array Images) */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => {
                const isSelected =
                  selectedImage?.id === img.id || selectedImage === img;
                return (
                  <button
                    key={img.id || index}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square h-20 w-20 overflow-hidden rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-600/20"
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={getImageUrl(img)}
                      alt={`${product?.name || "Produk"} thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* --- KOLOM KANAN: INFORMASI PRODUK & RINGKASAN OPSI --- */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Tag / Category Badge */}
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                {product?.tag || "Produk Industri"}
              </span>
            </div>

            {/* Judul Produk */}
            <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              {product?.name}
            </h1>

            {/* Meta Description Box (Highlight) */}
            {product?.metaDescription && (
              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
                <span className="font-semibold text-gray-800">Ringkasan: </span>
                {product.metaDescription}
              </div>
            )}

            {/* Spesifikasi Kunci / Tombol WhatsApp */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Halo, saya tertarik dengan produk ${product?.name || ""}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50 px-6 py-3.5 text-center text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100"
              >
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB DETAILED INFORMASI (DESKRIPSI / SPESIFIKASI HTML) */}
      <div className="mt-2 border-gray-200 pt-8">
        {/* Navigation Tabs */}
        <div className="flex gap-8 border-b border-gray-200 text-black">
          <p className="font-semibold">Deskripsi Lengkap</p>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          <div className="prose max-w-none text-sm leading-relaxed">
            <div
              className="prose dark:prose-invert max-w-none text-gray-900"
              dangerouslySetInnerHTML={{ __html: htmlBersih }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
