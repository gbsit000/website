import DOMPurify from "isomorphic-dompurify";
export default function AboutDetail({ aboutData }) {
  // 1. Bersihkan string HTML dari database (menghapus tag <script> berbahaya, dll)
  const cleanHTML = DOMPurify.sanitize(aboutData.description);

  return (
    <div className="prose max-w-4xl mx-auto p-8 text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">{aboutData.title}</h1>

      {/* 2. Tampilkan HTML yang sudah bersih */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: cleanHTML }}
      />
    </div>
  );
}
