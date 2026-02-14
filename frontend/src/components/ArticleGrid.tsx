import type { Article } from "../types";
import { ArticleCard } from "./ArticleCard";

interface ArticleGridProps {
  articles: Article[];
  isLoading: boolean;
  onArticleClick: (article: Article) => void;
}

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mb-2 h-6 w-full animate-pulse rounded bg-gray-200" />
      <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-lg font-medium text-gray-900">
        No articles found
      </h3>
      <p className="max-w-sm text-sm text-gray-500">
        No articles match your current filters. Try selecting a different source
        or click refresh to fetch new content.
      </p>
    </div>
  );
}

export function ArticleGrid({
  articles,
  isLoading,
  onArticleClick,
}: ArticleGridProps) {
  // Show skeleton loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (articles.length === 0) {
    return <EmptyState />;
  }

  // Render article grid
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onClick={() => onArticleClick(article)}
        />
      ))}
    </div>
  );
}
