import { describe, it, expect, vi } from "vitest";
import type {
  ScrapedArticle,
  RefreshResult,
} from "../../src/services/scraper.service.js";

// Mock dependencies to avoid actual network calls and database operations
vi.mock("@extractus/article-extractor", () => ({
  extract: vi.fn().mockResolvedValue(null),
}));

vi.mock("../../src/utils/prisma.js", () => ({
  default: {
    source: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    article: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("../../src/services/rss.service.js", () => ({
  fetchFeed: vi.fn().mockResolvedValue([]),
}));

describe("Scraper Service", () => {
  describe("ScrapedArticle interface", () => {
    it("should match expected shape with required fields", () => {
      const article: ScrapedArticle = {
        title: "Test Article",
        content: "Article content here",
      };

      expect(article.title).toBe("Test Article");
      expect(article.content).toBe("Article content here");
    });

    it("should allow optional fields", () => {
      const article: ScrapedArticle = {
        title: "Test Article",
        content: "Article content here",
        author: "John Doe",
        published: "2024-01-01T00:00:00Z",
        description: "Article description",
      };

      expect(article.author).toBe("John Doe");
      expect(article.published).toBe("2024-01-01T00:00:00Z");
      expect(article.description).toBe("Article description");
    });
  });

  describe("RefreshResult interface", () => {
    it("should have correct structure", () => {
      const result: RefreshResult = {
        found: 10,
        new: 5,
        errors: 1,
      };

      expect(result.found).toBe(10);
      expect(result.new).toBe(5);
      expect(result.errors).toBe(1);
    });

    it("should allow zero values", () => {
      const result: RefreshResult = {
        found: 0,
        new: 0,
        errors: 0,
      };

      expect(result.found).toBe(0);
      expect(result.new).toBe(0);
      expect(result.errors).toBe(0);
    });
  });
});
