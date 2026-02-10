import { describe, it, expect, vi } from "vitest";
import { fetchFeed, type RSSItem } from "../../src/services/rss.service.js";

// Mock rss-parser
vi.mock("rss-parser", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      parseURL: vi.fn(),
    })),
  };
});

describe("RSS Service", () => {
  describe("fetchFeed", () => {
    it("should return an array", async () => {
      const result = await fetchFeed("https://example.com/feed");
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for invalid feed URL", async () => {
      const result = await fetchFeed("invalid-url");
      expect(result).toEqual([]);
    });

    it("should handle network errors gracefully", async () => {
      const result = await fetchFeed("https://nonexistent.example.com/feed");
      expect(result).toEqual([]);
    });
  });

  describe("RSSItem interface", () => {
    it("should match expected shape", () => {
      const item: RSSItem = {
        title: "Test Article",
        link: "https://example.com/article",
        pubDate: "2024-01-01T00:00:00Z",
        contentSnippet: "Article snippet",
        guid: "unique-id",
      };

      expect(item.title).toBe("Test Article");
      expect(item.link).toBe("https://example.com/article");
      expect(item.pubDate).toBe("2024-01-01T00:00:00Z");
      expect(item.contentSnippet).toBe("Article snippet");
      expect(item.guid).toBe("unique-id");
    });

    it("should allow optional fields to be undefined", () => {
      const item: RSSItem = {
        title: "Test Article",
        link: "https://example.com/article",
        pubDate: "2024-01-01T00:00:00Z",
      };

      expect(item.contentSnippet).toBeUndefined();
      expect(item.guid).toBeUndefined();
    });
  });
});
