import { describe, it, expect } from "vitest";
import { generateContentHash } from "../../src/utils/hash.js";

describe("generateContentHash", () => {
  it("should generate consistent hash for same inputs", () => {
    const url = "https://example.com/article";
    const title = "Test Article Title";

    const hash1 = generateContentHash(url, title);
    const hash2 = generateContentHash(url, title);

    expect(hash1).toBe(hash2);
  });

  it("should generate different hashes for different URLs", () => {
    const title = "Test Article Title";
    const url1 = "https://example.com/article1";
    const url2 = "https://example.com/article2";

    const hash1 = generateContentHash(url1, title);
    const hash2 = generateContentHash(url2, title);

    expect(hash1).not.toBe(hash2);
  });

  it("should generate different hashes for different titles", () => {
    const url = "https://example.com/article";
    const title1 = "First Article Title";
    const title2 = "Second Article Title";

    const hash1 = generateContentHash(url, title1);
    const hash2 = generateContentHash(url, title2);

    expect(hash1).not.toBe(hash2);
  });

  it("should generate a 64-character hexadecimal hash", () => {
    const hash = generateContentHash("https://example.com", "Test Title");

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it("should handle empty strings", () => {
    const hash = generateContentHash("", "");

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it("should handle special characters", () => {
    const url = "https://example.com/article?foo=bar&baz=qux";
    const title = "Article with émojis 🎉 and <special> characters!";

    const hash = generateContentHash(url, title);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });
});
