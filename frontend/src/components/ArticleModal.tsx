import { useEffect, useCallback } from "react";
import type { Article } from "../types";

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  // Handle escape key to close modal
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !article) return null;

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-up">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-surface-elevated border border-border shadow-2xl shadow-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Decorative accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent to-transparent" />

        {/* Header */}
        <div className="sticky top-0 z-10 glass border-b border-border px-6 py-5">
          <div className="flex-1 pr-12">
            {/* Source Badge */}
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 border border-accent/20">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {article.source.name}
                </span>
              </span>
            </div>

            {/* Title */}
            <h2
              id="modal-title"
              className="font-display text-2xl font-bold leading-tight text-text-primary"
            >
              {article.title}
            </h2>

            {/* Date */}
            <p className="mt-2 flex items-center gap-2 text-sm text-text-muted">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <time dateTime={article.publishedAt} className="font-mono">
                {formattedDate}
              </time>
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-5 group rounded-xl p-2.5 text-text-muted transition-all duration-300 hover:bg-surface-hover hover:text-text-primary border border-transparent hover:border-border"
            aria-label="Close modal"
          >
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6 max-h-[50vh]">
          {/* Summary Section */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
                <svg
                  className="h-4 w-4 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                AI Summary
              </h3>
            </div>

            {article.summary ? (
              <div className="relative pl-4 border-l-2 border-accent/30">
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {article.summary}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-surface-hover border border-border p-4">
                <svg
                  className="h-5 w-5 text-text-muted animate-spin-slow"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-text-muted italic">
                  Summary is being generated. Please check back later.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass border-t border-border px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-text-secondary transition-all duration-300 hover:bg-surface-hover hover:text-text-primary border border-border"
            >
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back</span>
            </button>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-surface transition-all duration-300 hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/25"
            >
              {/* Animated background */}
              <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

              <span className="relative">Read Original</span>
              <svg
                className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom decorative accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent" />
      </div>
    </div>
  );
}
