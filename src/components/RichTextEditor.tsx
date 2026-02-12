import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Extension } from "@tiptap/core";
import { useRef, useState } from "react";

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

const FONT_COLORS = ["#000000", "#e03131", "#2f9e44", "#1971c2", "#f08c00", "#9c36b5", "#868e96"];
const HIGHLIGHT_COLORS = ["#fff3bf", "#d3f9d8", "#d0ebff", "#ffe3e3", "#e8d0ff", "#ffe8cc"];

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFontColor, setShowFontColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
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
        <button
          type="button"
          className={`xform-rte-btn ${editor.isActive("strike") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="刪除線"
        >
          <i className="bi bi-type-strikethrough" />
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

        {/* Font Color */}
        <div className="xform-rte-dropdown-wrap">
          <button
            type="button"
            className="xform-rte-btn"
            onClick={() => { setShowFontColor(!showFontColor); setShowHighlight(false); }}
            title="字體顏色"
          >
            <i className="bi bi-palette" />
          </button>
          {showFontColor && (
            <div className="xform-rte-color-dropdown">
              {FONT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="xform-rte-color-swatch"
                  style={{ background: c }}
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    setShowFontColor(false);
                  }}
                />
              ))}
              <button
                type="button"
                className="xform-rte-color-swatch xform-rte-color-reset"
                title="重設"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowFontColor(false);
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div className="xform-rte-dropdown-wrap">
          <button
            type="button"
            className={`xform-rte-btn ${editor.isActive("highlight") ? "active" : ""}`}
            onClick={() => { setShowHighlight(!showHighlight); setShowFontColor(false); }}
            title="螢光標記"
          >
            <i className="bi bi-highlighter" />
          </button>
          {showHighlight && (
            <div className="xform-rte-color-dropdown">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="xform-rte-color-swatch"
                  style={{ background: c }}
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color: c }).run();
                    setShowHighlight(false);
                  }}
                />
              ))}
              <button
                type="button"
                className="xform-rte-color-swatch xform-rte-color-reset"
                title="移除標記"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setShowHighlight(false);
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

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
