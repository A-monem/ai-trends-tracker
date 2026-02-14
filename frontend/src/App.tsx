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
    <div className="min-h-screen bg-gray-50">
      {/* Header with refresh button */}
      <Header />

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Source filter */}
        <section className="mb-6">
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
