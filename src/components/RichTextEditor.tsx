import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import { useRef } from "react";

// Custom FontSize extension
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attrs) => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      Image.configure({ inline: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      editor.chain().focus().setImage({ src: url }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleLink = () => {
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("輸入連結網址", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px"];

  return (
    <div className="xform-rte-wrapper">
      <div className="xform-rte-toolbar">
        <button
          type="button"
          className={`xform-rte-btn ${editor.isActive("bold") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="粗體"
        >
          <i className="bi bi-type-bold" />
        </button>
        <button
          type="button"
          className={`xform-rte-btn ${editor.isActive("italic") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="斜體"
        >
          <i className="bi bi-type-italic" />
        </button>
        <button
          type="button"
          className={`xform-rte-btn ${editor.isActive("underline") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="底線"
        >
          <i className="bi bi-type-underline" />
        </button>

        <span className="xform-rte-divider" />

        <select
          className="xform-rte-select"
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              (editor.chain().focus() as any).setFontSize(val).run();
            } else {
              (editor.chain().focus() as any).unsetFontSize().run();
            }
          }}
          defaultValue=""
          title="字型大小"
        >
          <option value="">字型大小</option>
          {fontSizes.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <span className="xform-rte-divider" />

        <button
          type="button"
          className={`xform-rte-btn ${editor.isActive("link") ? "active" : ""}`}
          onClick={handleLink}
          title="插入連結"
        >
          <i className="bi bi-link-45deg" />
        </button>

        <button
          type="button"
          className="xform-rte-btn"
          onClick={() => fileInputRef.current?.click()}
          title="插入圖片"
        >
          <i className="bi bi-image" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
      </div>

      <EditorContent editor={editor} className="xform-rte-content" />
    </div>
  );
}
