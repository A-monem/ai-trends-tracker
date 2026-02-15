import { useState, useRef, useEffect } from "react";
import type { SortField, SortOrder, SortOption } from "../types";

interface SortDropdownProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

const SORT_OPTIONS: SortOption[] = [
  { field: "publishedAt", order: "desc", label: "Newest First" },
  { field: "publishedAt", order: "asc", label: "Oldest First" },
  { field: "fetchedAt", order: "desc", label: "Recently Added" },
];

export function SortDropdown({
  sortBy,
  sortOrder,
  onSortChange,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current label
  const currentOption = SORT_OPTIONS.find(
    (opt) => opt.field === sortBy && opt.order === sortOrder,
  );
  const currentLabel = currentOption?.label || "Sort by";

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (option: SortOption) => {
    onSortChange(option.field, option.order);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group flex items-center gap-2.5 rounded-full px-4 py-1.5
          text-sm font-medium transition-all duration-300
          ${
            isOpen
              ? "bg-accent text-white shadow-lg shadow-accent/20"
              : "bg-surface-elevated text-text-secondary border border-border hover:border-accent hover:text-text-primary"
          }
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Sort Icon */}
        <svg
          className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M7 12h10" />
          <path d="M10 18h4" />
        </svg>

        <span className="font-display text-sm tracking-tight">
          {currentLabel}
        </span>

        {/* Chevron */}
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`
          absolute right-0 z-50 mt-2 w-52 origin-top-right
          transition-all duration-300 ease-out
          ${
            isOpen
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 -translate-y-2 pointer-events-none"
          }
        `}
        role="listbox"
      >
        <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-xl shadow-black/5 dark:shadow-black/20">
          {/* Header */}
          <div className="border-b border-border-subtle px-4 py-2.5">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-text-muted">
              Sort Articles
            </span>
          </div>

          {/* Options */}
          <div className="p-1.5">
            {SORT_OPTIONS.map((option, index) => {
              const isSelected =
                option.field === sortBy && option.order === sortOrder;

              return (
                <button
                  key={`${option.field}-${option.order}`}
                  onClick={() => handleSelect(option)}
                  className={`
                    group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                    text-left text-sm transition-all duration-200
                    animate-fade-up
                    ${
                      isSelected
                        ? "bg-accent-muted text-accent font-medium"
                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    }
                  `}
                  style={{ animationDelay: `${index * 30}ms` }}
                  role="option"
                  aria-selected={isSelected}
                >
                  {/* Icon based on sort type */}
                  <span
                    className={`
                      flex h-7 w-7 items-center justify-center rounded-md
                      transition-colors duration-200
                      ${
                        isSelected
                          ? "bg-accent text-white"
                          : "bg-surface-hover text-text-muted group-hover:bg-border group-hover:text-text-secondary"
                      }
                    `}
                  >
                    {option.field === "publishedAt" && (
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    )}
                    {option.field === "fetchedAt" && (
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    )}
                  </span>

                  {/* Label */}
                  <span className="flex-1">{option.label}</span>

                  {/* Order indicator */}
                  <span
                    className={`
                      font-mono text-[10px] uppercase tracking-wider
                      ${isSelected ? "text-accent" : "text-text-muted"}
                    `}
                  >
                    {option.order === "asc" ? "↑" : "↓"}
                  </span>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <svg
                      className="h-4 w-4 text-accent"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
