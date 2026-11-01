"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "next/link";

export interface TiptapEditorProps {
  articleId?: string;
  initialTitle?: string;
  initialSubtitle?: string;
  initialSlug?: string;
  initialExcerpt?: string;
  initialHtml?: string;
  initialCoverImageUrl?: string;
  initialStatus?: string;
  onSaved?: (savedAt: string) => void;
}

export function TiptapEditorialEditor({
  articleId: propArticleId,
  initialTitle = "",
  initialSubtitle = "",
  initialSlug = "",
  initialExcerpt = "",
  initialHtml = "<p></p>",
  initialCoverImageUrl = "",
  initialStatus = "DRAFT",
  onSaved,
}: TiptapEditorProps) {
  const articleIdRef = useRef<string | undefined>(propArticleId);
  const isSavingRef = useRef<boolean>(false);

  const [currentArticleId, setCurrentArticleId] = useState<string | undefined>(propArticleId);
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [slug, setSlug] = useState(initialSlug);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [coverImageUrl, setCoverImageUrl] = useState(initialCoverImageUrl);
  const [status, setStatus] = useState(initialStatus);
  const [saveState, setSaveState] = useState<"IDLE" | "SAVING" | "SAVED" | "ERROR">("IDLE");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: "Begin your essay with clarity and restraint..." }),
    ],
    content: initialHtml,
    immediatelyRender: false,
  });

  const persistDraft = useCallback(async (): Promise<string | undefined> => {
    if (!editor || title.trim().length < 3 || isSavingRef.current) return articleIdRef.current;
    isSavingRef.current = true;
    setSaveState("SAVING");

    try {
      const activeId = articleIdRef.current;
      const endpoint = activeId ? `/api/articles/${activeId}` : "/api/articles";
      const method = activeId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          slug: slug || undefined,
          excerpt,
          coverImageUrl: coverImageUrl.trim() || null,
          contentJson: editor.getJSON(),
          contentHtml: editor.getHTML(),
          clientUpdatedAt: lastUpdatedAt,
        }),
      });

      if (!response.ok) {
        setSaveState("ERROR");
        return activeId;
      }

      const data = await response.json();
      const resolvedId = activeId || data.article?.id || data.id;

      // Duplicate rokne ke liye: ID turant lock karein aur URL update karein
      if (resolvedId && !articleIdRef.current) {
        articleIdRef.current = resolvedId;
        setCurrentArticleId(resolvedId);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `/dashboard/articles/${resolvedId}/edit`);
        }
      }

      setLastUpdatedAt(data.savedAt || new Date().toISOString());
      setSaveState("SAVED");
      onSaved?.(data.savedAt);
      return resolvedId;
    } catch {
      setSaveState("ERROR");
      return articleIdRef.current;
    } finally {
      isSavingRef.current = false;
    }
  }, [editor, title, subtitle, slug, excerpt, coverImageUrl, lastUpdatedAt, onSaved]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title.trim().length >= 3) {
        void persistDraft();
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [title, subtitle, excerpt, coverImageUrl, persistDraft]);

  // Toolbar se article ke beech mein image daalne ke liye
  const handleInsertInlineImage = () => {
    const url = window.prompt("Enter Image URL (e.g. Unsplash or direct image link):");
    if (url && url.trim().startsWith("http")) {
      editor?.chain().focus().setImage({ src: url.trim() }).run();
    }
  };

  async function handleSubmitForReview() {
    setSubmitting(true);
    setNotice(null);

    if (title.trim().length < 5) {
      setNotice({ text: "Please enter a title of at least 5 characters.", type: "error" });
      setSubmitting(false);
      return;
    }

    const htmlContent = editor?.getHTML() || "";
    if (htmlContent.replace(/<[^>]*>/g, "").trim().length < 30) {
      setNotice({ text: "Please write substantive article content before submitting.", type: "error" });
      setSubmitting(false);
      return;
    }

    const activeId = await persistDraft();
    const targetId = activeId || articleIdRef.current || currentArticleId;

    if (!targetId) {
      setNotice({ text: "Please wait for draft to save before submitting.", type: "error" });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/articles/${targetId}/submit`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setNotice({ text: data.error || "Failed to submit article.", type: "error" });
      } else {
        setStatus("PENDING_REVIEW");
        setNotice({ text: "🎉 Article submitted for review! Admin can now review and publish it.", type: "success" });
      }
    } catch {
      setNotice({ text: "Network error submitting for review.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 bg-white border border-[#E9E6E0] rounded-lg p-6 md:p-10">
      {notice && (
        <div
          className={`p-3 rounded text-xs border ${
            notice.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9E6E0] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2.5 py-1 text-xs border border-[#E9E6E0] rounded hover:bg-[#FAF9F6]">H2</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className="px-2.5 py-1 text-xs border border-[#E9E6E0] rounded hover:bg-[#FAF9F6]">H3</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className="px-2.5 py-1 text-xs border border-[#E9E6E0] rounded hover:bg-[#FAF9F6] font-semibold">Bold</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className="px-2.5 py-1 text-xs border border-[#E9E6E0] rounded hover:bg-[#FAF9F6] italic">Italic</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className="px-2.5 py-1 text-xs border border-[#E9E6E0] rounded hover:bg-[#FAF9F6]">Quote</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className="px-2.5 py-1 text-xs border border-[#E9E6E0] rounded hover:bg-[#FAF9F6]">List</button>
          
          {/* Article ke andar image insert karne ka button */}
          <button
            type="button"
            onClick={handleInsertInlineImage}
            className="px-2.5 py-1 text-xs border border-[#2D4A3E] text-[#2D4A3E] rounded hover:bg-[#FAF9F6] font-medium"
          >
            🖼 Insert Image
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#77736E]">{saveState === "SAVING" ? "Saving..." : saveState === "SAVED" ? "Saved" : ""}</span>
          <span className={`text-xs px-2.5 py-1 rounded font-medium border ${status === "PUBLISHED" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : status === "PENDING_REVIEW" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-stone-50 text-stone-700 border-stone-200"}`}>
            {status === "PENDING_REVIEW" ? "Pending Review" : status}
          </span>

          {(status === "DRAFT" || status === "CHANGES_REQUESTED" || status === "REJECTED") && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitForReview}
              className="px-4 py-1.5 bg-[#2D4A3E] text-white text-xs font-medium rounded hover:bg-[#233a31] transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit for Review →"}
            </button>
          )}

          {status === "PUBLISHED" && slug && (
            <Link href={`/articles/${slug}`} target="_blank" className="text-xs text-[#2D4A3E] underline font-medium">
              View Live Article ↗
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline..."
          className="w-full font-serif-editorial text-3xl md:text-4xl text-[#191919] focus:outline-none"
        />
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Standfirst / subtitle..."
          className="w-full text-lg text-[#77736E] focus:outline-none"
        />

        {/* Thumbnail / Cover Image Input Box */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center p-3 bg-[#FAF9F6] border border-[#E9E6E0] rounded-md">
          <div className="flex-1 w-full">
            <label className="block text-[11px] uppercase tracking-wider text-[#77736E] mb-1 font-semibold">
              Cover Image / Thumbnail (Shows on Homepage Cards)
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="Paste thumbnail image URL (e.g. https://images.unsplash.com/photo-...)"
              className="w-full text-xs px-3 py-2 border border-[#E9E6E0] rounded bg-white focus:outline-none focus:border-[#2D4A3E]"
            />
          </div>
          {coverImageUrl.trim().startsWith("http") && (
            <div className="flex items-center gap-2">
              <img
                src={coverImageUrl}
                alt="Thumbnail preview"
                className="w-16 h-12 object-cover rounded border border-[#E9E6E0]"
              />
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Preview
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="custom-url-slug"
            className="text-xs px-3 py-2 border border-[#E9E6E0] rounded bg-[#FAF9F6]"
          />
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary excerpt..."
            className="text-xs px-3 py-2 border border-[#E9E6E0] rounded bg-[#FAF9F6]"
          />
        </div>
      </div>

      <div className="prose max-w-none min-h-[360px] pt-4 border-t border-[#E9E6E0]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}