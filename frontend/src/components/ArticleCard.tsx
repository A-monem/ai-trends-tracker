import type { Article } from "../types";

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const hasSummary = !!article.summary;

  return (
    <article
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-surface-elevated border border-border p-6 transition-all duration-500 hover:border-accent/40 hover:bg-surface-hover hover-lift"
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Header: Source Badge & Time */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Source indicator dot */}
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            {article.source.name}
          </span>
        </div>
        <time
          className="font-mono text-xs text-text-muted tabular-nums"
          dateTime={article.publishedAt}
          title={new Date(article.publishedAt).toLocaleString()}
        >
          {formatRelativeTime(article.publishedAt)}
        </time>
      </div>

      {/* Title - Editorial style */}
      <h2 className="font-display text-xl font-semibold leading-tight text-text-primary mb-3 line-clamp-2 group-hover:text-accent transition-colors duration-300">
        {article.title}
      </h2>

      {/* Summary Preview */}
      <div className="relative">
        {hasSummary ? (
          <p className="text-sm leading-relaxed text-text-secondary line-clamp-3">
            {article.summary}
          </p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <svg
              className="h-4 w-4 animate-pulse"
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
            <span className="italic">Summary generating...</span>
          </div>
        )}
      </div>

      {/* Footer - Read more indicator */}
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted group-hover:text-text-secondary transition-colors">
          {hasSummary ? "Read full summary" : "Pending"}
        </span>
        <div className="flex items-center gap-1 text-text-muted group-hover:text-accent transition-colors">
          <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Open
          </span>
          <svg
            className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none" />
    </article>
  );
}
