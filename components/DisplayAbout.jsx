"use client";

import DOMPurify from "dompurify";

export default function DisplayAbout({ title, description }) {
  // Membersihkan kode HTML sebelum di-render
  const cleanHTML =
    typeof window !== "undefined" && DOMPurify.sanitize
      ? DOMPurify.sanitize(description)
      : description;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: cleanHTML }}
      />
    </div>
  );
}
