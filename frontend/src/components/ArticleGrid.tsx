import type { Article } from "../types";
import { ArticleCard } from "./ArticleCard";

interface ArticleGridProps {
  articles: Article[];
  isLoading: boolean;
  onArticleClick: (article: Article) => void;
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="rounded-xl bg-surface-elevated border border-border p-5 animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-shimmer" />
          <div className="h-3 w-20 rounded animate-shimmer" />
        </div>
        <div className="h-3 w-8 rounded animate-shimmer" />
      </div>

      {/* Title skeleton */}
      <div className="space-y-2 mb-3">
        <div className="h-5 w-full rounded animate-shimmer" />
        <div className="h-5 w-3/4 rounded animate-shimmer" />
      </div>

      {/* Summary skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded animate-shimmer" />
        <div className="h-3 w-full rounded animate-shimmer" />
        <div className="h-3 w-2/3 rounded animate-shimmer" />
      </div>

      {/* Footer skeleton */}
      <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
        <div className="h-3 w-20 rounded animate-shimmer" />
        <div className="h-4 w-4 rounded animate-shimmer" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-fade-up">
      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated border border-border mb-5">
        <svg
          className="h-8 w-8 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      </div>

      <h3 className="font-display text-xl font-semibold text-text-primary mb-2">
        No stories found
      </h3>
      <p className="max-w-sm text-text-secondary text-sm">
        There are no articles matching your current filter. Try selecting a
        different source or sync to fetch the latest content.
      </p>
    </div>
  );
}

export function ArticleGrid({
  articles,
  isLoading,
  onArticleClick,
}: ArticleGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => (
        <div
          key={article.id}
          className="h-full animate-fade-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ArticleCard
            article={article}
            onClick={() => onArticleClick(article)}
          />
        </div>
      ))}
    </div>
  );
}
