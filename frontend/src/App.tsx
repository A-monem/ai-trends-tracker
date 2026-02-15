import { useState } from "react";
import {
  Header,
  SourceFilter,
  ArticleGrid,
  ArticleModal,
  Pagination,
} from "./components";
import { useArticles, useSources } from "./hooks";
import type { Article } from "./types";

function App() {
  // State
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries
  const { data: sourcesData, isLoading: isLoadingSources } = useSources();

  const { data: articlesData, isLoading: isLoadingArticles } = useArticles({
    source: selectedSource ?? undefined,
    page: currentPage,
    limit: 12,
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

  // Extract data
  const sources = sourcesData?.data ?? [];
  const articles = articlesData?.data ?? [];
  const pagination = articlesData?.pagination;

  return (
    <div className="relative min-h-screen bg-surface">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 mesh-gradient opacity-50" />

        {/* Radial glow effects */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--color-text-muted) 1px, transparent 1px),
                             linear-gradient(90deg, var(--color-text-muted) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Grain texture */}
        <div className="grain" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with refresh button */}
        <Header />

        {/* Main content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-8 animate-fade-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-8 bg-accent rounded-full" />
              <h2 className="font-display text-3xl font-bold text-text-primary">
                Latest Stories
              </h2>
            </div>
            <p className="text-text-secondary ml-5">
              AI news and insights, curated and summarized
            </p>
          </div>

          {/* Source filter */}
          <section className="mb-8">
            <SourceFilter
              sources={sources}
              selected={selectedSource}
              onSelect={handleSourceSelect}
              isLoading={isLoadingSources}
            />
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
        <footer className="border-t border-border mt-12">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-accent to-amber-600">
                  <svg
                    className="h-4 w-4 text-surface"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="font-display text-lg font-semibold text-text-primary">
                  AI <span className="text-accent">Trends</span>
                </span>
              </div>

              <p className="text-sm text-text-muted">
                Powered by Claude AI • Built with React & TypeScript
              </p>
            </div>
          </div>
        </footer>
      </div>

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
