import React, { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { FontSize } from "./FontSize";

import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Minus, Image as ImageIcon,
  RotateCcw, RotateCw, RemoveFormatting, Sparkles, Send, Upload, X, Check,
  Highlighter, Palette, ChevronDown, Download, FileText
} from "lucide-react";
import AiSidebar from "./AiSidebar";
import { useAiStream } from "../../hooks/useAiStream";
import { exportToMarkdown, exportToPDF, exportToDocx } from "../../utils/exportUtils";

const FONT_FAMILIES = [
  { label: "Default Serif", value: "Lora, Georgia, serif" },
  { label: "Modern Sans", value: "Inter, sans-serif" },
  { label: "Editorial Monospace", value: "JetBrains Mono, monospace" },
  { label: "Playfair Display", value: "Playfair Display, serif" },
];

const FONT_SIZES = ["14px", "16px", "18px", "20px", "24px", "28px", "32px"];
const TEXT_COLORS = ["#1A1A1A", "#4B5563", "#DC2626", "#D97706", "#059669", "#2563EB", "#7C3AED", "#DB2777"];
const HIGHLIGHT_COLORS = ["#FEF08A", "#BBF7D0", "#BAE6FD", "#FED7AA", "#FBCFE8", "#E9D5FF"];

export default function Editor({ onPublishComplete }) {
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [category, setCategory] = useState("article");

  const [currentFontSize, setCurrentFontSize] = useState("18px");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const { output, isStreaming, error, streamResponse } = useAiStream();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      ImageExtension.configure({ inline: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Start typing your story, thoughts, or press Gemini to brainstorm...",
      }),
    ],
    content: "<p>Start typing your thoughts here...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert prose-lg focus:outline-none max-w-none w-full min-h-[500px] p-6 sm:p-8 font-serif leading-relaxed",
      },
    },
  });

  const handleFontSizeChange = (size) => {
    setCurrentFontSize(size);
    editor.chain().focus().setFontSize(size).run();
  };

  const handleAiAction = (actionType) => {
    setIsAiSidebarOpen(true);
    const draftText = editor?.getText() || "";
    let prompt = "";

    if (actionType === "outline") {
      prompt = `Generate a structured outline for an article titled "${title || "Next-Gen Web Architecture"}"`;
    } else if (actionType === "titles") {
      prompt = `Suggest 5 captivating, editorial headlines based on this content:\n${draftText.slice(0, 500)}`;
    } else if (actionType === "tldr") {
      prompt = `Write a clean 3-bullet point executive summary (TL;DR) of this draft:\n${draftText}`;
    }

    streamResponse(prompt, draftText);
  };

  const handleCustomPrompt = (customText) => {
    setIsAiSidebarOpen(true);
    const draftText = editor?.getText() || "";
    streamResponse(customText, draftText);
  };

  const handleInsertAiText = (aiText) => {
    if (!editor || !aiText) return;
    const formattedHtml = aiText
      .split("\n\n")
      .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
      .join("");

    editor.chain().focus().insertContent(formattedHtml).run();
  };

  const wordCount = editor
    ? editor.state.doc.textContent.split(/\s+/).filter(Boolean).length
    : 0;

  const handlePublish = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a title before publishing.");
      return;
    }

    const newArticle = {
      id: `art-${Date.now()}`,
      title: title.trim(),
      category: category,
      excerpt: editor.getText().slice(0, 160) + "...",
      content: editor.getHTML(),
      author: "Rohit Zade",
      author_id: "user_rohit",
      date: "Just now",
      read_time: `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
      type: category === "essay" ? "Essay" : category === "newsletter" ? "Newsletter" : "Article",
      cover_image: coverImage,
    };

    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      setIsPublishModalOpen(false);
      if (onPublishComplete) {
        onPublishComplete(newArticle);
      }
    }, 1200);
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96 text-neutral-400">
        Loading editor engine...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] w-full bg-neutral-100 dark:bg-[#111111] text-neutral-800 dark:text-neutral-200">
      
      {/* 1. Office-Style Ribbon Bar */}
      <div className="sticky top-16 z-20 bg-white dark:bg-[#1A1A1A] border-b border-editorial-border dark:border-[#2C2C2C] px-4 py-2.5 flex flex-wrap items-center justify-between gap-y-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* History */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#262626] disabled:opacity-30 rounded transition"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#262626] disabled:opacity-30 rounded transition"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-neutral-200 dark:bg-[#333333] mx-1" />

          {/* Font Family */}
          <select
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            className="h-8 text-xs border border-editorial-border dark:border-[#3A3A3A] rounded px-2 bg-white dark:bg-[#222222] text-neutral-900 dark:text-white focus:outline-none"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          {/* Font Size */}
          <select
            value={currentFontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="h-8 text-xs border border-editorial-border dark:border-[#3A3A3A] rounded px-2 bg-white dark:bg-[#222222] text-neutral-900 dark:text-white focus:outline-none"
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="w-[1px] h-5 bg-neutral-200 dark:bg-[#333333] mx-1" />

          {/* Formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition ${editor.isActive("bold") ? "bg-neutral-200 dark:bg-[#333] text-neutral-900 dark:text-white" : "hover:bg-neutral-100 dark:hover:bg-[#262626]"}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition ${editor.isActive("italic") ? "bg-neutral-200 dark:bg-[#333] text-neutral-900 dark:text-white" : "hover:bg-neutral-100 dark:hover:bg-[#262626]"}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded transition ${editor.isActive("underline") ? "bg-neutral-200 dark:bg-[#333] text-neutral-900 dark:text-white" : "hover:bg-neutral-100 dark:hover:bg-[#262626]"}`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded transition ${editor.isActive("strike") ? "bg-neutral-200 dark:bg-[#333] text-neutral-900 dark:text-white" : "hover:bg-neutral-100 dark:hover:bg-[#262626]"}`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* Palette Colors */}
          <div className="relative">
            <button
              onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-[#262626] rounded flex items-center gap-0.5"
              title="Text Color"
            >
              <Palette className="w-4 h-4" />
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {showColorPicker && (
              <div className="absolute top-9 left-0 bg-white dark:bg-[#222222] border border-editorial-border dark:border-[#3A3A3A] shadow-xl p-2 rounded-lg grid grid-cols-4 gap-1.5 z-50">
                {TEXT_COLORS.map((hex) => (
                  <button
                    key={hex}
                    style={{ backgroundColor: hex }}
                    onClick={() => { editor.chain().focus().setColor(hex).run(); setShowColorPicker(false); }}
                    className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:scale-110 transition"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-[1px] h-5 bg-neutral-200 dark:bg-[#333333] mx-1" />

          {/* Alignment */}
          <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-[#262626]" title="Align Left">
            <AlignLeft className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-[#262626]" title="Align Center">
            <AlignCenter className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-[#262626]" title="Align Right">
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-neutral-200 dark:bg-[#333333] mx-1" />

          {/* Headings */}
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-[#262626]" title="H1">
            <Heading1 className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-[#262626]" title="H2">
            <Heading2 className="w-4 h-4" />
          </button>

          {/* Lists */}
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-[#262626]" title="Bullet List">
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-[#262626]" title="Quote">
            <Quote className="w-4 h-4" />
          </button>

          {/* Inline Image Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) editor.chain().focus().setImage({ src: URL.createObjectURL(file) }).run();
            }}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 text-xs border border-editorial-border dark:border-[#3A3A3A] rounded hover:bg-neutral-100 dark:hover:bg-[#262626]"
            title="Insert Picture"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-editorial-border dark:border-[#3A3A3A] hover:bg-neutral-50 dark:hover:bg-[#262626] rounded-lg text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-9 w-44 bg-white dark:bg-[#1F1F1F] border border-editorial-border dark:border-[#333333] shadow-xl rounded-xl p-1.5 z-50">
                <button
                  onClick={() => {
                    exportToMarkdown(title, editor.getText());
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-[#2A2A2A] rounded-lg flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  <span>Markdown (.md)</span>
                </button>
                <button
                  onClick={() => {
                    exportToPDF("printable-canvas", title);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-[#2A2A2A] rounded-lg flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-red-500" />
                  <span>PDF Document (.pdf)</span>
                </button>
                <button
                  onClick={() => {
                    exportToDocx(title, editor.getText());
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-[#2A2A2A] rounded-lg flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Word Document (.docx)</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-lg text-xs font-semibold hover:bg-amber-200 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Gemini
          </button>

          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
          >
            <Send className="w-3.5 h-3.5" />
            Publish
          </button>
        </div>
      </div>

      {/* 2. Main Centered Document Canvas */}
      <div className="flex-1 w-full py-8 px-4 flex justify-center items-start">
        <div
          id="printable-canvas"
          className="w-full max-w-3xl bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-editorial-border dark:border-[#2C2C2C] flex flex-col min-h-[750px] transition-colors"
          onClick={() => editor.commands.focus()}
        >
          {/* Article Cover Upload Banner */}
          <div className="p-6 sm:p-8 pb-4 border-b border-neutral-100 dark:border-[#242424]" onClick={(e) => e.stopPropagation()}>
            {coverImage ? (
              <div className="relative w-full h-64 rounded-xl overflow-hidden mb-5">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button
                  onClick={() => setCoverImage(null)}
                  className="absolute top-3 right-3 bg-neutral-900/80 text-white p-1.5 rounded-full hover:bg-neutral-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setCoverImage(URL.createObjectURL(file));
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition py-2 px-3 rounded-lg border border-dashed border-neutral-300 dark:border-[#3A3A3A]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Add Article Cover Image</span>
                </button>
              </div>
            )}

            {/* Document Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of your publication..."
              className="font-serif text-3xl sm:text-4xl font-bold bg-transparent focus:outline-none w-full placeholder:text-neutral-300 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white"
            />
          </div>

          {/* Tiptap Writing Sheet */}
          <div className="flex-1 w-full cursor-text">
            <EditorContent editor={editor} className="w-full h-full" />
          </div>

          {/* Footer Metadata */}
          <div className="p-4 bg-neutral-50 dark:bg-[#141414] border-t border-neutral-200 dark:border-[#262626] rounded-b-2xl text-neutral-400 text-xs flex justify-between select-none">
            <span>Inkwell Precision Writing Canvas</span>
            <span>{wordCount} words • {Math.max(1, Math.ceil(wordCount / 200))} min read</span>
          </div>
        </div>
      </div>

      {/* 3. Floating AI Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 transition-transform duration-300 transform ${isAiSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <AiSidebar
          isOpen={isAiSidebarOpen}
          onClose={() => setIsAiSidebarOpen(false)}
          onApplyAction={handleAiAction}
          onCustomPrompt={handleCustomPrompt}
          onInsertText={handleInsertAiText}
          output={output}
          isStreaming={isStreaming}
          error={error}
        />
      </div>

      {/* 4. Publish Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-editorial-border dark:border-[#2C2C2C]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">Publish Publication</h3>
              <button onClick={() => setIsPublishModalOpen(false)} className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Publication Channel</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm border border-neutral-300 dark:border-[#3A3A3A] bg-transparent rounded-lg p-2.5 text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="article" className="text-black">Technical Article (Reader Section)</option>
                  <option value="essay" className="text-black">Essay & Thoughtpiece</option>
                  <option value="newsletter" className="text-black">Weekly Newsletter Dispatch</option>
                </select>
              </div>

              <div className="pt-2">
                {publishSuccess ? (
                  <div className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Published Successfully!
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition"
                  >
                    Confirm & Publish
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}