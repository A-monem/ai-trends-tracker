import type { Article } from "../types";

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
}

// Format relative time (e.g., "2 hours ago", "3 days ago")
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const hasNoSummary = !article.summary;

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
    >
      {/* Header: Source and Date */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          {article.source.name}
        </span>
        <time
          className="text-xs text-gray-500"
          dateTime={article.publishedAt}
          title={new Date(article.publishedAt).toLocaleString()}
        >
          {formatRelativeTime(article.publishedAt)}
        </time>
      </div>

      {/* Title */}
      <h2 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
        {article.title}
      </h2>

      {/* Summary Preview */}
      {article.summary ? (
        <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
          {article.summary}
        </p>
      ) : (
        <p className="text-sm italic text-gray-400">
          Summary not yet available...
        </p>
      )}

      {/* Footer indicator */}
      <div className="mt-4 flex items-center justify-between">
        <span
          className={`text-xs ${hasNoSummary ? "text-amber-600" : "text-gray-400"}`}
        >
          {hasNoSummary ? "Pending summary" : "Click to read more"}
        </span>
        <svg
          className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </article>
  );
}
