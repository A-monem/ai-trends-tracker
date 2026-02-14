import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArticleCard } from "../../src/components/ArticleCard";
import type { Article } from "../../src/types";

const mockArticle: Article = {
  id: "1",
  sourceId: "source-1",
  title: "Test Article Title",
  url: "https://example.com/article",
  summary: "This is a test summary of the article content.",
  contentHash: "abc123",
  publishedAt: new Date().toISOString(),
  fetchedAt: new Date().toISOString(),
  summarizedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  source: {
    id: "source-1",
    name: "TechCrunch",
    slug: "techcrunch",
    type: "rss",
    feedUrl: "https://techcrunch.com/feed",
    websiteUrl: "https://techcrunch.com",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

describe("ArticleCard", () => {
  it("renders article title", () => {
    render(<ArticleCard article={mockArticle} onClick={() => {}} />);
    expect(screen.getByText("Test Article Title")).toBeInTheDocument();
  });

  it("renders source name", () => {
    render(<ArticleCard article={mockArticle} onClick={() => {}} />);
    expect(screen.getByText("TechCrunch")).toBeInTheDocument();
  });

  it("renders summary", () => {
    render(<ArticleCard article={mockArticle} onClick={() => {}} />);
    expect(
      screen.getByText("This is a test summary of the article content."),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<ArticleCard article={mockArticle} onClick={handleClick} />);

    fireEvent.click(screen.getByText("Test Article Title"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows pending message when summary is null", () => {
    const articleWithoutSummary = { ...mockArticle, summary: null };
    render(<ArticleCard article={articleWithoutSummary} onClick={() => {}} />);
    expect(
      screen.getByText("Summary not yet available..."),
    ).toBeInTheDocument();
  });
});
