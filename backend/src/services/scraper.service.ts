import { extract } from "@extractus/article-extractor";
import prisma from "../utils/prisma.js";
import { logger } from "../utils/logger.js";
import { generateContentHash } from "../utils/hash.js";
import { fetchFeed } from "./rss.service.js";

// Scraped article interface
export interface ScrapedArticle {
  title: string;
  content: string;
  author?: string;
  published?: string;
  description?: string;
}

// Refresh result interface
export interface RefreshResult {
  found: number;
  new: number;
  errors: number;
}

// Rate limiting: track last request time per domain
const domainLastRequest = new Map<string, number>();
const RATE_LIMIT_MS = 1000; // 1 request per second per domain

/**
 * Extracts domain from URL for rate limiting
 */
function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Waits for rate limit to clear for a domain
 */
async function waitForRateLimit(domain: string): Promise<void> {
  const lastRequest = domainLastRequest.get(domain) || 0;
  const timeSince = Date.now() - lastRequest;

  if (timeSince < RATE_LIMIT_MS) {
    const waitTime = RATE_LIMIT_MS - timeSince;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  domainLastRequest.set(domain, Date.now());
}

/**
 * Scrapes article content from a URL
 *
 * @param url - The article URL to scrape
 * @returns Scraped article content or null if scraping fails
 */
export async function scrapeArticle(
  url: string,
): Promise<ScrapedArticle | null> {
  try {
    const domain = getDomain(url);
    await waitForRateLimit(domain);

    logger.debug(`Scraping article: ${url}`);

    const article = await extract(url);

    if (!article || !article.content) {
      logger.warn(`No content extracted from ${url}`);
      return null;
    }

    return {
      title: article.title || "",
      content: article.content,
      author: article.author || undefined,
      published: article.published || undefined,
      description: article.description || undefined,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Failed to scrape article ${url}: ${errorMessage}`);
    return null;
  }
}

/**
 * Refreshes articles from a single source
 *
 * @param sourceId - The source ID to refresh
 * @returns Refresh statistics
 */
export async function refreshSource(sourceId: string): Promise<RefreshResult> {
  const result: RefreshResult = { found: 0, new: 0, errors: 0 };

  try {
    // Get source details
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
    });

    if (!source || !source.feedUrl) {
      logger.warn(`Source ${sourceId} not found or has no feed URL`);
      return result;
    }

    logger.info(`Refreshing source: ${source.name}`);

    // Fetch RSS feed
    const items = await fetchFeed(source.feedUrl);
    result.found = items.length;

    // Process each item
    for (const item of items) {
      try {
        // Generate content hash for deduplication
        const contentHash = generateContentHash(item.link, item.title);

        // Check if article already exists
        const existing = await prisma.article.findFirst({
          where: { contentHash },
        });

        if (existing) {
          logger.debug(`Article already exists: ${item.title}`);
          continue;
        }

        // Create article record
        await prisma.article.create({
          data: {
            sourceId: source.id,
            title: item.title,
            url: item.link,
            contentHash,
            publishedAt: new Date(item.pubDate),
            // Store scraped description for later summarization
            summary: null,
          },
        });

        result.new++;
        logger.info(`Added new article: ${item.title}`);
      } catch (error) {
        result.errors++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error(`Error processing article ${item.title}: ${errorMessage}`);
      }
    }

    logger.info(
      `Source ${source.name} refresh complete: ${result.found} found, ${result.new} new, ${result.errors} errors`,
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Failed to refresh source ${sourceId}: ${errorMessage}`);
    result.errors++;
  }

  return result;
}

/**
 * Refreshes articles from all active sources
 *
 * @returns Aggregated refresh statistics
 */
export async function refreshAllSources(): Promise<RefreshResult> {
  const aggregated: RefreshResult = { found: 0, new: 0, errors: 0 };

  try {
    // Get all active sources
    const sources = await prisma.source.findMany({
      where: { isActive: true },
    });

    logger.info(`Refreshing ${sources.length} active sources`);

    // Refresh each source sequentially
    for (const source of sources) {
      const result = await refreshSource(source.id);
      aggregated.found += result.found;
      aggregated.new += result.new;
      aggregated.errors += result.errors;
    }

    logger.info(
      `All sources refresh complete: ${aggregated.found} found, ${aggregated.new} new, ${aggregated.errors} errors`,
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Failed to refresh all sources: ${errorMessage}`);
    aggregated.errors++;
  }

  return aggregated;
}

export default {
  scrapeArticle,
  refreshSource,
  refreshAllSources,
};
