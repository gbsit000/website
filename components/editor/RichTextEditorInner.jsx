"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Base64UploadAdapter,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  PageBreak,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  Undo,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import "./editor.css";
export default function RichTextEditorInner({
  value = "",
  onChange,
  placeholder = "Tulis sesuatu di sini...",
  minHeight = "300px",
  disabled = false,
  // Class Tailwind Typography yang dipasang di wrapper supaya
  // heading/paragraph/list/quote di dalam editor ikut ter-styling.
  // Set "" kalau tidak mau pakai prose sama sekali.
  proseClassName = "prose max-w-none",
}) {
  const config = {
    // Lisensi open source (GPL). Untuk proyek komersial/closed source,
    // ganti dengan license key dari https://portal.ckeditor.com
    licenseKey: "GPL",
    placeholder,

    plugins: [
      Alignment,
      Autoformat,
      AutoImage,
      AutoLink,
      Autosave,
      Base64UploadAdapter,
      BlockQuote,
      Bold,
      Code,
      CodeBlock,
      Essentials,
      FindAndReplace,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      GeneralHtmlSupport,
      Heading,
      Highlight,
      HorizontalLine,
      HtmlEmbed,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsert,
      ImageResize,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      List,
      ListProperties,
      MediaEmbed,
      PageBreak,
      Paragraph,
      PasteFromOffice,
      RemoveFormat,
      SelectAll,
      ShowBlocks,
      SourceEditing,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersCurrency,
      SpecialCharactersEssentials,
      SpecialCharactersLatin,
      SpecialCharactersMathematical,
      SpecialCharactersText,
      Strikethrough,
      Subscript,
      Superscript,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextTransformation,
      TodoList,
      Underline,
      Undo,
    ],

    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "findAndReplace",
        "selectAll",
        "|",
        "heading",
        "|",
        "fontFamily",
        "fontSize",
        "fontColor",
        "fontBackgroundColor",
        "highlight",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "subscript",
        "superscript",
        "code",
        "removeFormat",
        "|",
        "alignment",
        "|",
        "bulletedList",
        "numberedList",
        "todoList",
        "outdent",
        "indent",
        "|",
        "link",
        "insertImage",
        "mediaEmbed",
        "insertTable",
        "blockQuote",
        "codeBlock",
        "htmlEmbed",
        "|",
        "horizontalLine",
        "pageBreak",
        "specialCharacters",
        "|",
        "showBlocks",
        "sourceEditing",
      ],
      // Semua tombol tampil, toolbar dibungkus ke baris berikutnya
      // (bukan disembunyikan di menu "⋮")
      shouldNotGroupWhenFull: true,
    },

    heading: {
      options: [
        {
          model: "paragraph",
          title: "Paragraf",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading1",
          view: "h1",
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2",
          view: "h2",
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: "h3",
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
        {
          model: "heading4",
          view: "h4",
          title: "Heading 4",
          class: "ck-heading_heading4",
        },
      ],
    },

    fontFamily: { supportAllValues: true },
    fontSize: {
      options: [10, 12, 14, "default", 18, 20, 24, 28, 32, 36],
      supportAllValues: true,
    },

    list: {
      properties: { styles: true, startIndex: true, reversed: true },
    },

    image: {
      toolbar: [
        "toggleImageCaption",
        "imageTextAlternative",
        "|",
        "imageStyle:inline",
        "imageStyle:wrapText",
        "imageStyle:breakText",
        "|",
        "resizeImage",
      ],
    },

    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "|",
        "tableProperties",
        "tableCellProperties",
        "toggleTableCaption",
      ],
    },

    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: "https://",
      decorators: {
        toggleDownloadable: {
          mode: "manual",
          label: "Downloadable",
          attributes: { download: "file" },
        },
      },
    },

    codeBlock: {
      languages: [
        { language: "plaintext", label: "Plain text" },
        { language: "javascript", label: "JavaScript" },
        { language: "typescript", label: "TypeScript" },
        { language: "html", label: "HTML" },
        { language: "css", label: "CSS" },
        { language: "sql", label: "SQL" },
        { language: "json", label: "JSON" },
        { language: "bash", label: "Bash" },
      ],
    },

    // PENTING: jangan izinkan tag yang sudah dikelola fitur khusus
    // (Heading, Paragraph, List, Table, Link, Image, dst) lewat GHS —
    // itu bikin bentrok dan heading/list jadi tidak berfungsi.
    // Hanya izinkan tag "ekstra" yang tidak punya plugin sendiri.
    htmlSupport: {
      allow: [
        {
          name: /^(div|span|section|article|iframe|video|audio|source|style)$/,
          attributes: true,
          classes: true,
          styles: true,
        },
      ],
    },
  };

  return (
    <div
      className={`rte-wrapper ${proseClassName}`}
      style={{ "--rte-min-height": minHeight }}
    >
      <CKEditor
        editor={ClassicEditor}
        config={config}
        data={value}
        disabled={disabled}
        onChange={(_event, editor) => {
          onChange?.(editor.getData());
        }}
      />
    </div>
  );
}
