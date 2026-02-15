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
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 shrink-0 animate-shimmer rounded-lg"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scroll fade indicators */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-2 w-6 bg-linear-to-r from-surface to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-6 bg-linear-to-l from-surface to-transparent z-10" />

      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {/* All Button */}
        <button
          onClick={() => onSelect(null)}
          className={`relative shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            selected === null
              ? "text-accent"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          All
          {selected === null && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" />
          )}
        </button>

        {/* Source Buttons */}
        {sources.map((source, index) => (
          <button
            key={source.id}
            onClick={() => onSelect(source.slug)}
            className={`relative shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 animate-fade-up ${
              selected === source.slug
                ? "text-accent"
                : "text-text-muted hover:text-text-secondary"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="flex items-center gap-2">
              {source.name}
              {source.articleCount !== undefined && source.articleCount > 0 && (
                <span className="font-mono text-xs text-text-muted/60">
                  {source.articleCount}
                </span>
              )}
            </span>
            {selected === source.slug && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Bottom border line */}
      <div className="h-px bg-border -mt-px" />
    </div>
  );
}
