import { createHash } from "crypto";

/**
 * Generates a SHA-256 hash for content deduplication.
 * Uses URL and title to create a unique identifier for each article.
 *
 * @param url - The article URL
 * @param title - The article title
 * @returns A 64-character hexadecimal hash string
 */
export function generateContentHash(url: string, title: string): string {
  const content = `${url}${title}`;
  return createHash("sha256").update(content).digest("hex");
}

export default generateContentHash;
