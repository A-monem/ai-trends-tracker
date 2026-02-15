import type { Source } from "../types";

interface SourceFilterProps {
  sources: Source[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
  isLoading?: boolean;
}

export function SourceFilter({
  sources,
  selected,
  onSelect,
  isLoading,
}: SourceFilterProps) {
  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 shrink-0 animate-shimmer rounded-full"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* All Button */}
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
            selected === null
              ? "bg-accent text-white shadow-sm"
              : "bg-surface-elevated text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border"
          }`}
        >
          All
        </button>

        {/* Source Buttons */}
        {sources.map((source, index) => (
          <button
            key={source.id}
            onClick={() => onSelect(source.slug)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 animate-fade-up ${
              selected === source.slug
                ? "bg-accent text-white shadow-sm"
                : "bg-surface-elevated text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="flex items-center gap-2">
              {source.name}
              {source.articleCount !== undefined && source.articleCount > 0 && (
                <span
                  className={`font-mono text-xs ${
                    selected === source.slug
                      ? "text-white/70"
                      : "text-text-muted"
                  }`}
                >
                  {source.articleCount}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
