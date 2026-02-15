interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push("...");
      }

      // Show pages around current
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 py-10 animate-fade-up">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!canGoPrevious}
        className="group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary transition-all duration-300 hover:bg-surface-elevated hover:text-text-primary border border-border disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
        aria-label="Previous page"
      >
        <svg
          className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1 group-disabled:translate-x-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageNum, index) => (
          <span key={index}>
            {pageNum === "..." ? (
              <span className="px-2 text-text-muted font-mono">•••</span>
            ) : (
              <button
                onClick={() => onPageChange(pageNum as number)}
                disabled={pageNum === page}
                className={`min-w-[40px] h-10 rounded-xl text-sm font-medium transition-all duration-300 ${
                  pageNum === page
                    ? "bg-accent text-surface shadow-lg shadow-accent/20"
                    : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary border border-transparent hover:border-border"
                }`}
                aria-label={`Go to page ${pageNum}`}
                aria-current={pageNum === page ? "page" : undefined}
              >
                <span className="font-mono">{pageNum}</span>
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!canGoNext}
        className="group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary transition-all duration-300 hover:bg-surface-elevated hover:text-text-primary border border-border disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <svg
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-disabled:translate-x-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
