import Parser from "rss-parser";
import { logger } from "../utils/logger.js";

// RSS parser instance
const parser = new Parser({
  timeout: 10000, // 10 second timeout
  headers: {
    "User-Agent": "AI-Trends-Tracker/1.0",
  },
});

// RSS item interface
export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  guid?: string;
}

/**
 * Fetches and parses an RSS feed from the given URL
 *
 * @param feedUrl - The URL of the RSS feed to fetch
 * @returns Array of parsed RSS items
 */
export async function fetchFeed(feedUrl: string): Promise<RSSItem[]> {
  try {
    logger.info(`Fetching RSS feed: ${feedUrl}`);

    const feed = await parser.parseURL(feedUrl);

    const items: RSSItem[] = (feed.items || [])
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!,
        link: item.link!,
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        contentSnippet: item.contentSnippet || item.content || undefined,
        guid: item.guid || item.link,
      }));

    logger.info(`Fetched ${items.length} items from ${feedUrl}`);
    return items;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Failed to fetch RSS feed ${feedUrl}: ${errorMessage}`);
    return [];
  }
}

export default { fetchFeed };
