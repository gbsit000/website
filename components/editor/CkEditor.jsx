// components/custom-editor.js
"use client"; // Required only in App Router.

import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor, Essentials, Paragraph, Bold, Italic } from "ckeditor5";

function CustomEditor() {
  return (
    <CKEditor
      editor={ClassicEditor}
      config={{
        licenseKey: "GPL",
        plugins: [Essentials, Paragraph, Bold, Italic],
        toolbar: ["undo", "redo", "|", "bold", "italic"],
        root: {
          initialData: "<p>Hello from CKEditor 5 in Next.js!</p>",
        },
      }}
    />
  );
}

export default CustomEditor;
