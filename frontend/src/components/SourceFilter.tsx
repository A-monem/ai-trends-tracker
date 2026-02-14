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
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          selected === null
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All Sources
      </button>
      {sources.map((source) => (
        <button
          key={source.id}
          onClick={() => onSelect(source.slug)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selected === source.slug
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {source.name}
          {source.articleCount !== undefined && (
            <span className="ml-1.5 text-xs opacity-70">
              ({source.articleCount})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
