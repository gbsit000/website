"use client";

import dynamic from "next/dynamic";

// CKEditor 5 mengakses `window`/`document` saat modul dimuat,
// jadi wajib di-load hanya di client (ssr: false).
const RichTextEditorInner = dynamic(() => import("./RichTextEditorInner"), {
  ssr: false,
  loading: () => (
    <div
      className="rte-skeleton prose"
      role="status"
      aria-label="Memuat editor"
    >
      <div className="rte-skeleton-toolbar" />
      <div className="rte-skeleton-body" />
    </div>
  ),
});

export default function RichTextEditor(props) {
  return <RichTextEditorInner {...props} />;
}
