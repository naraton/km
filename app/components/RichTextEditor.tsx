"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import { useEffect, useState, useRef } from "react";
// @ts-ignore
import Picker from "@emoji-mart/react";
// @ts-ignore
import data from "@emoji-mart/data";

import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaCode,
  FaLink,
  FaImage,
  FaListUl,
  FaListOl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaMinus,
  FaSmile,
  FaUndo,
  FaRedo,
  FaChevronDown,
} from "react-icons/fa";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [fontSize, setFontSize] = useState("16");
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-purple-600 underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none min-h-[300px] p-6 text-slate-800 bg-white",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!editor) return null;

  // จัดการการเปลี่ยนระดับ Heading
  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "p") {
      editor.chain().focus().setParagraph().run();
    } else if (val === "h1") {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (val === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (val === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  const getHeadingValue = () => {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "p";
  };

  // จัดการอัปโหลด/ใส่ลิงก์รูปภาพ
  const addImage = () => {
    const url = window.prompt("กรุณากรอก URL ของรูปภาพ:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // จัดการใส่ Hyperlink
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("กรุณากรอก URL ลิงก์:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addEmoji = (emoji: any) => {
    editor.chain().focus().insertContent(emoji.native).run();
    setShowEmojiPicker(false);
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all shadow-sm">
      {/* Top Toolbar สไตล์ Notion / Docs */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white border-b border-slate-200 text-slate-600">
        
        {/* 1. Heading Dropdown */}
        <div className="relative flex items-center">
          <select
            value={getHeadingValue()}
            onChange={handleHeadingChange}
            className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-1.5 pl-2.5 pr-6 rounded-lg cursor-pointer focus:outline-none transition-colors"
          >
            <option value="p">Normal text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
          <FaChevronDown className="w-2.5 h-2.5 absolute right-2 text-slate-400 pointer-events-none" />
        </div>

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        {/* 2. Font Size Dropdown */}
        <div className="relative flex items-center">
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-1.5 pl-2.5 pr-6 rounded-lg cursor-pointer focus:outline-none transition-colors"
          >
            <option value="12">12</option>
            <option value="14">14</option>
            <option value="16">16</option>
            <option value="18">18</option>
            <option value="20">20</option>
            <option value="24">24</option>
          </select>
          <FaChevronDown className="w-2.5 h-2.5 absolute right-2 text-slate-400 pointer-events-none" />
        </div>

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        {/* 3. Text Formatting (Bold, Italic, Strike, Code) */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors ${
            editor.isActive("bold") ? "bg-slate-200 text-slate-900 font-bold" : ""
          }`}
          title="Bold"
        >
          <FaBold />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors ${
            editor.isActive("italic") ? "bg-slate-200 text-slate-900 font-bold" : ""
          }`}
          title="Italic"
        >
          <FaItalic />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors ${
            editor.isActive("strike") ? "bg-slate-200 text-slate-900 font-bold" : ""
          }`}
          title="Strikethrough"
        >
          <FaStrikethrough />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors ${
            editor.isActive("code") ? "bg-slate-200 text-slate-900 font-bold" : ""
          }`}
          title="Inline Code"
        >
          <FaCode />
        </button>

        {/* Text Color Picker */}
        <div className="relative flex items-center p-1 rounded-md hover:bg-slate-100 cursor-pointer">
          <span className="text-xs font-bold underline decoration-purple-500 decoration-2">A</span>
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            title="Text Color"
          />
        </div>

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        {/* 4. Insert Options (Link, Image, Emoji) */}
        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors ${
            editor.isActive("link") ? "bg-slate-200 text-purple-600" : ""
          }`}
          title="Link"
        >
          <FaLink />
        </button>

        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors"
          title="Image"
        >
          <FaImage />
        </button>

        {/* Emoji Picker */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 rounded-md text-xs text-amber-500 hover:bg-amber-50 transition-colors"
            title="Emoji"
          >
            <FaSmile />
          </button>

          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-2 z-50 shadow-xl rounded-2xl overflow-hidden border border-slate-200">
              <Picker data={data} onEmojiSelect={addEmoji} theme="light" previewPosition="none" skinTonePosition="none" />
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        {/* 5. Lists & Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors ${
            editor.isActive("bulletList") ? "bg-slate-200 text-slate-900" : ""
          }`}
          title="Bullet List"
        >
          <FaListUl />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors ${
            editor.isActive("orderedList") ? "bg-slate-200 text-slate-900" : ""
          }`}
          title="Numbered List"
        >
          <FaListOl />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors ${
            editor.isActive({ textAlign: "left" }) ? "bg-slate-200 text-slate-900" : ""
          }`}
          title="Align Left"
        >
          <FaAlignLeft />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors ${
            editor.isActive({ textAlign: "center" }) ? "bg-slate-200 text-slate-900" : ""
          }`}
          title="Align Center"
        >
          <FaAlignCenter />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors ${
            editor.isActive({ textAlign: "right" }) ? "bg-slate-200 text-slate-900" : ""
          }`}
          title="Align Right"
        >
          <FaAlignRight />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors"
          title="Divider Line"
        >
          <FaMinus />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        {/* 6. Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors disabled:opacity-30"
          title="Undo"
        >
          <FaUndo />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors disabled:opacity-30"
          title="Redo"
        >
          <FaRedo />
        </button>
      </div>

      {/* Editor Main Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}