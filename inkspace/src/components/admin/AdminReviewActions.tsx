"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AdminReviewActionsProps {
  articleId: string;
  currentStatus: string;
  slug: string;
  title: string;
}

export function AdminReviewActions({
  articleId,
  currentStatus,
  slug,
}: AdminReviewActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState<"REQUEST_CHANGES" | "REJECT" | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function handleDecision(decision: "APPROVE" | "PUBLISH" | "REQUEST_CHANGES" | "REJECT" | "UNPUBLISH", customFeedback?: string) {
    setLoading(true);
    setMessage(null);

    const feedbackToSend = customFeedback ?? feedback;
    if ((decision === "REQUEST_CHANGES" || decision === "REJECT") && feedbackToSend.trim().length < 15) {
      setMessage({ text: "Please provide at least 15 characters of feedback for the author.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, decision, feedback: feedbackToSend }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.error || "Failed to execute review action.", type: "error" });
      } else {
        const nextStatus =
          decision === "PUBLISH" ? "PUBLISHED" : decision === "APPROVE" ? "APPROVED" : decision === "REQUEST_CHANGES" ? "CHANGES_REQUESTED" : decision === "REJECT" ? "REJECTED" : "DRAFT";
        setStatus(nextStatus);
        setShowFeedbackModal(null);
        setFeedback("");
        setMessage({
          text: `Article successfully ${decision === "PUBLISH" ? "published to live site!" : decision.toLowerCase() + "ed."}`,
          type: "success",
        });
        router.refresh();
      }
    } catch {
      setMessage({ text: "Network error submitting review decision.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-[#E9E6E0] rounded-lg p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9E6E0] pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#77736E] block">Editorial Moderation Actions</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-[#191919]">Status:</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-medium border ${
                status === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : status === "PENDING_REVIEW"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : status === "APPROVED"
                  ? "bg-blue-50 text-blue-800 border-blue-200"
                  : status === "CHANGES_REQUESTED"
                  ? "bg-orange-50 text-orange-800 border-orange-200"
                  : "bg-stone-50 text-stone-700 border-stone-200"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {status === "PUBLISHED" && (
          <Link href={`/articles/${slug}`} target="_blank" className="text-xs text-[#2D4A3E] font-medium underline">
            View Live Public Article ↗
          </Link>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded text-xs border ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {status !== "PUBLISHED" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision("PUBLISH")}
            className="px-4 py-2 bg-[#2D4A3E] text-white text-xs font-medium rounded hover:bg-[#233a31] transition-colors disabled:opacity-50"
          >
            {loading ? "Publishing..." : "✓ Publish Article"}
          </button>
        )}

        {status === "PENDING_REVIEW" && (
          <>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDecision("APPROVE")}
              className="px-4 py-2 bg-[#FAF9F6] border border-[#2D4A3E] text-[#2D4A3E] text-xs font-medium rounded hover:bg-stone-100 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowFeedbackModal("REQUEST_CHANGES")}
              className="px-4 py-2 bg-[#FAF9F6] border border-orange-300 text-orange-700 text-xs font-medium rounded hover:bg-orange-50 disabled:opacity-50"
            >
              Request Changes
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowFeedbackModal("REJECT")}
              className="px-4 py-2 bg-[#FAF9F6] border border-rose-300 text-rose-700 text-xs font-medium rounded hover:bg-rose-50 disabled:opacity-50"
            >
              Reject
            </button>
          </>
        )}

        {status === "PUBLISHED" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision("UNPUBLISH")}
            className="px-4 py-2 bg-[#FAF9F6] border border-[#E9E6E0] text-[#77736E] text-xs font-medium rounded hover:bg-stone-100 disabled:opacity-50"
          >
            Unpublish (Revert to Draft)
          </button>
        )}
      </div>

      {showFeedbackModal && (
        <div className="mt-4 p-4 border border-[#E9E6E0] bg-[#FAF9F6] rounded-md space-y-3">
          <p className="text-xs text-[#77736E]">Write constructive feedback for the author (minimum 15 characters):</p>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. Please expand the introduction and add references..."
            className="w-full text-xs p-2.5 border border-[#E9E6E0] rounded bg-white focus:outline-none focus:border-[#2D4A3E]"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowFeedbackModal(null)} className="px-3 py-1.5 text-xs text-[#77736E]">
              Cancel
            </button>
            <button
              type="button"
              disabled={loading || feedback.trim().length < 15}
              onClick={() => handleDecision(showFeedbackModal)}
              className="px-4 py-1.5 bg-[#2D4A3E] text-white text-xs font-medium rounded hover:bg-[#233a31] disabled:opacity-50"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}