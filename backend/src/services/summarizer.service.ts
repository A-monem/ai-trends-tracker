import Anthropic from "@anthropic-ai/sdk";
import prisma from "../utils/prisma.js";
import { logger } from "../utils/logger.js";
import { scrapeArticle } from "./scraper.service.js";

// Validate API key on module load
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable is required");
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configuration from environment variables (with defaults)
const MODEL = process.env.AI_MODEL || "claude-haiku-4-5-20251001";
const MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || "300", 10);
const BATCH_SIZE = parseInt(process.env.AI_BATCH_SIZE || "10", 10);
const MAX_CONTENT_LENGTH = 10000; // ~2500 tokens - prevents API errors
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// System prompt for summarization
const SYSTEM_PROMPT = `You are an AI news summarizer. Your task is to create concise, informative summaries of AI-related articles.

Focus on:
- Key developments and announcements
- Technical implications and innovations
- Why this matters to the AI community
- Practical applications or impacts

Keep summaries:
- Under 150 words
- Factual and objective
- Accessible to a technical audience
- Free of marketing language

Return only the summary text, no headers or prefixes.`;

/**
 * Delays execution for exponential backoff
 */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Summarizes article content using Claude 3.5 Haiku
 *
 * @param content - The article content to summarize
 * @returns Generated summary text
 */
export async function summarizeArticle(content: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.debug(`Summarization attempt ${attempt}/${MAX_RETRIES}`);

      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Please summarize this article:\n\n${content.slice(0, MAX_CONTENT_LENGTH)}`,
          },
        ],
      });

      logger.debug(
        `Received response from Anthropic API on attempt ${attempt}`,
      );

      // Extract text from response
      const textBlock = response.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text content in response");
      }

      return textBlock.text.trim();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(
        `Summarization attempt ${attempt} failed: ${lastError.message}`,
      );

      if (attempt < MAX_RETRIES) {
        const delayMs = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
        logger.debug(`Retrying in ${delayMs}ms...`);
        await delay(delayMs);
      }
    }
  }

  throw lastError || new Error("Summarization failed after all retries");
}

/**
 * Summarizes all unsummarized articles
 *
 * @param limit - Maximum number of articles to summarize (optional)
 * @returns Number of articles summarized
 */
export async function summarizeUnsummarized(limit?: number): Promise<number> {
  let summarizedCount = 0;

  try {
    // Query articles without summaries (use BATCH_SIZE as default)
    const articles = await prisma.article.findMany({
      where: { summary: null },
      orderBy: { publishedAt: "desc" },
      take: limit ?? BATCH_SIZE,
    });

    logger.info(`Found ${articles.length} articles to summarize`);

    for (const article of articles) {
      try {
        // Scrape article content for summarization
        const scraped = await scrapeArticle(article.url);

        if (!scraped || !scraped.content) {
          logger.warn(`Could not scrape content for: ${article.title}`);
          continue;
        }

        logger.debug(
          `Scraped content for "${article.title}": ${scraped.content.length} characters`,
        );

        // Generate summary
        const summary = await summarizeArticle(scraped.content);

        // Update article with summary
        await prisma.article.update({
          where: { id: article.id },
          data: {
            summary,
            summarizedAt: new Date(),
          },
        });

        summarizedCount++;
        logger.info(`Summarized article: ${article.title}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error(
          `Failed to summarize article ${article.title}: ${errorMessage}`,
        );
      }
    }

    logger.info(
      `Summarization complete: ${summarizedCount} articles processed`,
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Failed to summarize unsummarized articles: ${errorMessage}`);
  }

  return summarizedCount;
}

export default {
  summarizeArticle,
  summarizeUnsummarized,
};
