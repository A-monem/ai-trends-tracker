import { useState } from "react";
import {
  Header,
  SourceFilter,
  SortDropdown,
  ArticleGrid,
  ArticleModal,
  Pagination,
} from "./components";
import { useArticles, useSources } from "./hooks";
import type { Article, SortField, SortOrder } from "./types";

function App() {
  // State
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>("publishedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Queries
  const { data: sourcesData, isLoading: isLoadingSources } = useSources();

  const { data: articlesData, isLoading: isLoadingArticles } = useArticles({
    source: selectedSource ?? undefined,
    page: currentPage,
    limit: 12,
    sortBy,
    sortOrder,
  });

  // Handlers
  const handleSourceSelect = (slug: string | null) => {
    setSelectedSource(slug);
    setCurrentPage(1); // Reset to first page when changing source
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  // Extract data
  const sources = sourcesData?.data ?? [];
  const articles = articlesData?.data ?? [];
  const pagination = articlesData?.pagination;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Source filter */}
            <div className="flex-1 overflow-hidden">
              <SourceFilter
                sources={sources}
                selected={selectedSource}
                onSelect={handleSourceSelect}
                isLoading={isLoadingSources}
              />
            </div>

            {/* Sort dropdown */}
            <div className="shrink-0">
              <SortDropdown
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />
            </div>
          </div>
        </section>

        {/* Articles grid */}
        <section>
          <ArticleGrid
            articles={articles}
            isLoading={isLoadingArticles}
            onArticleClick={handleArticleClick}
          />
        </section>

        {/* Pagination */}
        {pagination && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
                <svg
                  className="h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12h4l3-8 4 16 3-8h4" />
                </svg>
              </div>
              <span className="font-display text-base font-semibold text-text-primary">
                AI Trends
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Article detail modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;
