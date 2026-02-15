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
      className="rounded-2xl bg-surface-elevated border border-border p-6 animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-shimmer" />
          <div className="h-3 w-20 rounded animate-shimmer" />
        </div>
        <div className="h-3 w-8 rounded animate-shimmer" />
      </div>

      {/* Title skeleton */}
      <div className="space-y-2 mb-4">
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
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <div className="h-3 w-24 rounded animate-shimmer" />
        <div className="h-4 w-4 rounded animate-shimmer" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center animate-fade-up">
      {/* Decorative icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-elevated border border-border">
          <svg
            className="h-10 w-10 text-text-muted"
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
      </div>

      <h3 className="font-display text-2xl font-semibold text-text-primary mb-2">
        No stories found
      </h3>
      <p className="max-w-md text-text-secondary mb-6">
        There are no articles matching your current filter. Try selecting a
        different source or sync to fetch the latest content.
      </p>

      {/* Decorative elements */}
      <div className="flex items-center gap-2 text-text-muted">
        <div className="w-12 h-px bg-border" />
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <div className="w-12 h-px bg-border" />
      </div>
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
          className="animate-fade-up"
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
