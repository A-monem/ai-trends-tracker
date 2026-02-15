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
      className="group relative h-full flex flex-col cursor-pointer overflow-hidden rounded-xl bg-surface-elevated border border-border p-5 transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-black/5"
    >
      {/* Header: Source Badge & Time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            {article.source.name}
          </span>
        </div>
        <time
          className="font-mono text-xs text-text-muted tabular-nums"
          dateTime={article.publishedAt}
          title={`Published: ${new Date(article.publishedAt).toLocaleString()}`}
        >
          {formatRelativeTime(article.publishedAt)}
        </time>
      </div>

      {/* Title */}
      <h2 className="font-display text-lg font-semibold leading-snug text-text-primary mb-2.5 line-clamp-2 group-hover:text-accent transition-colors duration-300">
        {article.title}
      </h2>

      {/* Summary Preview */}
      <div className="relative flex-1">
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

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-border-subtle flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted group-hover:text-text-secondary transition-colors">
          {hasSummary ? "Read more" : "Pending"}
        </span>
        <svg
          className="h-4 w-4 text-text-muted group-hover:text-accent transition-all duration-300 group-hover:translate-x-1"
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
    </article>
  );
}
