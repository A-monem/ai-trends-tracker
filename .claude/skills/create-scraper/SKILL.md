---
name: create-scraper
description: Generate a new content scraper following project conventions. Creates scraper service, tests, and integrates with the content pipeline.
argument-hint: [source-name] [source-type:rss|youtube|hackernews|reddit]
---

# Create Scraper: $ARGUMENTS

Generate a new scraper for **$0** of type **$1** following the project's content pipeline architecture.

## Architecture Context

The scraper integrates into the content pipeline defined in TECHNICAL_REQUIREMENTS.md:

```
┌──────────┐    ┌──────────┐    ┌───────────┐    ┌─────────┐    ┌─────────┐
│  Source  │───▶│  Parse   │───▶│  Extract  │───▶│  Store  │───▶│Summarize│
│  Feed    │    │  Feed    │    │  Content  │    │   DB    │    │ Claude  │
└──────────┘    └──────────┘    └───────────┘    └─────────┘    └─────────┘
```

## Implementation Checklist

### 1. Create Scraper Service File
**Path:** `backend/src/services/$0.scraper.ts`

**Requirements:**
- [ ] Implements the scraper interface from `scraper.service.ts`
- [ ] Uses correct library based on source type (see Source Type Guidelines below)
- [ ] Implements content extraction for full article text
- [ ] Implements SHA-256 deduplication hash using `url + title`
- [ ] Follows rate limiting: 1 request/second per domain
- [ ] Integrates with fetch tracking (creates Fetch records)
- [ ] Returns normalized data ready for database insertion

**Template Structure:**
```typescript
import { createHash } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { extract } from '@extractus/article-extractor';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface ScrapedArticle {
  title: string;
  url: string;
  contentHash: string;
  content: string | null;
  publishedAt: Date;
  guid: string;
}

export class $0Scraper {
  private sourceSlug = '$0'.toLowerCase().replace(/\s+/g, '-');

  /**
   * Check if scraper has required configuration
   */
  canScrape(): boolean {
    // Check environment variables, API keys, etc.
    return true;
  }

  /**
   * Generate SHA-256 hash for deduplication
   * Per TECHNICAL_REQUIREMENTS.md: hash(url + title)
   */
  private generateContentHash(url: string, title: string): string {
    return createHash('sha256')
      .update(url + title)
      .digest('hex');
  }

  /**
   * Extract full article content from URL
   * Uses @extractus/article-extractor per TECHNICAL_REQUIREMENTS.md
   */
  private async extractContent(url: string): Promise<string | null> {
    try {
      const article = await extract(url);
      return article?.content || null;
    } catch (error) {
      logger.warn(`[$0] Failed to extract content from ${url}`);
      return null;
    }
  }

  /**
   * Rate-limited delay between requests
   * 1 request/second per domain (polite crawling)
   */
  private async rateLimit(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Main scrape method
   */
  async scrape(maxItems = 50): Promise<ScrapedArticle[]> {
    const source = await prisma.source.findUnique({
      where: { slug: this.sourceSlug }
    });

    if (!source) {
      throw new Error(`Source not found: ${this.sourceSlug}`);
    }

    // Create fetch record for tracking
    const fetch = await prisma.fetch.create({
      data: {
        sourceId: source.id,
        status: 'running',
        startedAt: new Date(),
      }
    });

    try {
      logger.info(`[$0] Starting scrape for source: ${source.name}`);

      // Implementation based on source type
      const rawItems = await this.fetchFromSource(source, maxItems);

      const results: ScrapedArticle[] = [];
      let newArticles = 0;

      for (const item of rawItems) {
        const contentHash = this.generateContentHash(item.url, item.title);

        // Check for duplicates
        const existing = await prisma.article.findFirst({
          where: { contentHash }
        });

        if (existing) {
          logger.debug(`[$0] Skipping duplicate: ${item.title}`);
          continue;
        }

        // Extract full content (with rate limiting)
        await this.rateLimit();
        const content = await this.extractContent(item.url);

        results.push({
          title: item.title,
          url: item.url,
          contentHash,
          content,
          publishedAt: item.publishedAt,
          guid: item.guid,
        });

        newArticles++;
      }

      // Update fetch record
      await prisma.fetch.update({
        where: { id: fetch.id },
        data: {
          status: 'completed',
          articlesFound: rawItems.length,
          articlesNew: newArticles,
          completedAt: new Date(),
        }
      });

      logger.info(`[$0] Scrape complete: ${newArticles} new of ${rawItems.length} total`);
      return results;

    } catch (error: any) {
      // Update fetch record with error
      await prisma.fetch.update({
        where: { id: fetch.id },
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        }
      });

      throw error;
    }
  }

  /**
   * Fetch raw items from source - implement based on type
   */
  private async fetchFromSource(
    source: { feedUrl: string | null; channelId: string | null },
    maxItems: number
  ): Promise<Array<{ title: string; url: string; publishedAt: Date; guid: string }>> {
    // Type-specific implementation goes here
    throw new Error('Not implemented - see Source Type Guidelines');
  }
}
```

### 2. Create Test File
**Path:** `backend/tests/services/$0.scraper.test.ts`

**Requirements:**
- [ ] Test `canScrape()` returns correct value based on config
- [ ] Test `generateContentHash()` produces consistent SHA-256 hashes
- [ ] Test `scrape()` with mocked HTTP responses
- [ ] Test deduplication logic (skip existing articles)
- [ ] Test error handling matches TECHNICAL_REQUIREMENTS.md patterns
- [ ] Test fetch tracking records are created/updated correctly
- [ ] Mock `@extractus/article-extractor` for content extraction tests

**Template:**
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { $0Scraper } from '../../src/services/$0.scraper';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    source: {
      findUnique: vi.fn(),
    },
    article: {
      findFirst: vi.fn(),
    },
    fetch: {
      create: vi.fn().mockResolvedValue({ id: 'test-fetch-id' }),
      update: vi.fn(),
    },
  })),
}));

// Mock article extractor
vi.mock('@extractus/article-extractor', () => ({
  extract: vi.fn().mockResolvedValue({
    title: 'Test Article',
    content: 'Test content for the article...',
  }),
}));

describe('$0Scraper', () => {
  let scraper: $0Scraper;

  beforeEach(() => {
    scraper = new $0Scraper();
    vi.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true when properly configured', () => {
      expect(scraper.canScrape()).toBe(true);
    });

    it('should return false when missing required config', () => {
      // Test with missing environment variables
    });
  });

  describe('generateContentHash', () => {
    it('should generate consistent SHA-256 hash', () => {
      const hash1 = (scraper as any).generateContentHash(
        'https://example.com/article',
        'Test Title'
      );
      const hash2 = (scraper as any).generateContentHash(
        'https://example.com/article',
        'Test Title'
      );
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = (scraper as any).generateContentHash('url1', 'title1');
      const hash2 = (scraper as any).generateContentHash('url2', 'title2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('scrape', () => {
    it('should create fetch record on start', async () => {
      // Test fetch tracking
    });

    it('should skip duplicate articles', async () => {
      // Test deduplication
    });

    it('should update fetch record on completion', async () => {
      // Test successful completion
    });

    it('should update fetch record on failure', async () => {
      // Test error handling
    });
  });

  describe('error handling', () => {
    it('should handle source unavailable gracefully', async () => {
      // Per TECHNICAL_REQUIREMENTS.md: Log error, skip source, continue with others
    });

    it('should handle article scrape failure', async () => {
      // Per TECHNICAL_REQUIREMENTS.md: Store article without full content, use description
    });

    it('should handle rate limiting (429)', async () => {
      // Per TECHNICAL_REQUIREMENTS.md: Retry with exponential backoff
    });
  });
});
```

### 3. Register in Scraper Service
**Path:** `backend/src/services/scraper.service.ts`

**Add to scraper factory/registry:**
```typescript
import { $0Scraper } from './$0.scraper';

// In createScraperForSource() or similar:
export function createScraperForSource(type: string) {
  switch (type) {
    case 'rss':
      return new RssScraper();
    case 'youtube':
      return new YouTubeScraper();
    case 'hackernews':
      return new HackerNewsScraper();
    case 'reddit':
      return new RedditScraper();
    // Add new scraper:
    case '$1':
      return new $0Scraper();
    default:
      throw new Error(`Unknown source type: ${type}`);
  }
}
```

### 4. Add Source to Database Seed
**Path:** `backend/prisma/seed.ts`

**Add source configuration:**
```typescript
await prisma.source.upsert({
  where: { slug: '$0'.toLowerCase().replace(/\\s+/g, '-') },
  update: {},
  create: {
    name: '$0',
    slug: '$0'.toLowerCase().replace(/\\s+/g, '-'),
    type: '$1',
    feedUrl: 'FEED_URL_HERE',        // For RSS type
    channelId: 'CHANNEL_ID_HERE',    // For YouTube type (V1)
    websiteUrl: 'https://example.com',
    isActive: true,
  },
});
```

### 5. Environment Variables (if required)
**Path:** `backend/.env` and `backend/.env.example`

```env
# Add any required API keys or configuration
# Example for YouTube (V1):
# YOUTUBE_API_KEY=AIza...
```

### 6. Validation Steps

After implementation, verify:
- [ ] TypeScript compiles: `cd backend && npm run build`
- [ ] Tests pass: `cd backend && npm test`
- [ ] Scraper integrates with refresh endpoint
- [ ] Fetch records are created in database
- [ ] Deduplication works (run twice, second run should find 0 new)
- [ ] Content extraction works for articles
- [ ] Rate limiting is respected (check timing between requests)

---

## Source Type Guidelines

### RSS Feeds (MVP)

Per TECHNICAL_REQUIREMENTS.md Section: Content Pipeline > RSS feeds

**Libraries:**
- `rss-parser` - Parse RSS/Atom feeds
- `@extractus/article-extractor` - Extract full article content

**Rate Limits:**
- RSS fetches: No limit needed
- Article scraping: 1 request/second per domain

**Implementation:**
```typescript
import Parser from 'rss-parser';
import { extract } from '@extractus/article-extractor';

export class ${Name}RssScraper {
  private parser = new Parser();
  private feedUrl: string;

  async fetchFromSource(source: { feedUrl: string | null }, maxItems: number) {
    if (!source.feedUrl) {
      throw new Error('RSS source requires feedUrl');
    }

    const feed = await this.parser.parseURL(source.feedUrl);

    return feed.items.slice(0, maxItems).map(item => ({
      title: item.title || '',
      url: item.link || '',
      publishedAt: new Date(item.pubDate || Date.now()),
      guid: item.guid || item.link || '',
      // contentSnippet available as fallback if extraction fails
      contentSnippet: item.contentSnippet || '',
    }));
  }

  // Override extractContent to use article-extractor
  async extractContent(url: string): Promise<string | null> {
    try {
      const article = await extract(url);
      // Returns: title, content (HTML cleaned), author, published, description
      return article?.content || null;
    } catch (error) {
      // Per TECHNICAL_REQUIREMENTS.md: Use RSS description as fallback
      logger.warn(`Failed to extract content, using snippet fallback`);
      return null;
    }
  }
}
```

**Error Handling (per TECHNICAL_REQUIREMENTS.md):**
| Scenario | Handling |
|----------|----------|
| RSS feed unavailable | Log error, skip source, continue with others |
| Article scrape fails | Store article without full content, use RSS description |
| Duplicate article | Skip silently (expected behavior) |

---

### YouTube (V1)

Per TECHNICAL_REQUIREMENTS.md Section: V1: YouTube Pipeline

**Libraries:**
- Native `fetch` or `axios` for YouTube Data API v3
- `youtube-transcript` - Extract auto-generated captions

**API Quotas:**
| Operation | Quota Cost | Daily Limit |
|-----------|------------|-------------|
| Search (list videos) | 100 units | 10,000 units/day |
| Videos (get details) | 1 unit | 10,000 units/day |
| Captions (via package) | 0 units | No limit |

**Required Environment Variables:**
```env
YOUTUBE_API_KEY=AIza...
```

**Implementation:**
```typescript
import { YoutubeTranscript } from 'youtube-transcript';

export class ${Name}YouTubeScraper {
  private apiKey = process.env.YOUTUBE_API_KEY;
  private channelId: string;
  private readonly YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

  canScrape(): boolean {
    return !!this.apiKey;
  }

  async fetchFromSource(source: { channelId: string | null }, maxItems: number) {
    if (!source.channelId) {
      throw new Error('YouTube source requires channelId');
    }

    const response = await fetch(
      `${this.YOUTUBE_API_URL}/search?` +
      `key=${this.apiKey}&` +
      `channelId=${source.channelId}&` +
      `part=snippet&` +
      `order=date&` +
      `maxResults=${maxItems}&` +
      `type=video`
    );

    const data = await response.json();
    // Returns: videoId, title, description, publishedAt, channelTitle

    return data.items.map((item: any) => ({
      title: item.snippet.title,
      url: `https://youtube.com/watch?v=${item.id.videoId}`,
      publishedAt: new Date(item.snippet.publishedAt),
      guid: item.id.videoId,
      description: item.snippet.description,
    }));
  }

  /**
   * Extract transcript instead of article content
   * Per TECHNICAL_REQUIREMENTS.md: Use youtube-transcript package
   */
  async extractContent(videoId: string): Promise<string | null> {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      // Combine all segments into single text
      return transcript.map(segment => segment.text).join(' ');
    } catch (error) {
      // Per TECHNICAL_REQUIREMENTS.md: Some videos don't have transcripts
      logger.warn(`No transcript available for video ${videoId}`);
      return null;
    }
  }
}
```

**Error Handling (per TECHNICAL_REQUIREMENTS.md):**
| Scenario | Handling |
|----------|----------|
| No transcript available | Store video without summary, mark as `transcript_unavailable` |
| API quota exceeded | Log error, skip YouTube fetch, continue with RSS |
| Video is private/deleted | Skip silently |
| Non-English transcript | Accept (Claude handles multilingual) |

**Target Channels (examples):**
| Channel | Focus |
|---------|-------|
| Two Minute Papers | AI research paper breakdowns |
| Andrej Karpathy | Deep learning tutorials |
| Yannic Kilcher | ML paper reviews |
| AI Explained | AI news and explainers |

---

### Hacker News (V1)

Per TECHNICAL_REQUIREMENTS.md Section: V1: Hacker News Pipeline

**Data Source:** Firebase API (free, no auth required)

| Endpoint | Description |
|----------|-------------|
| `/v0/topstories.json` | Top 500 story IDs |
| `/v0/beststories.json` | Best stories |
| `/v0/item/{id}.json` | Individual story details |

**AI Filtering Keywords:**
```typescript
const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'ml',
  'llm', 'gpt', 'claude', 'openai', 'anthropic', 'neural',
  'deep learning', 'transformer', 'diffusion', 'generative',
  'chatbot', 'nlp'
];

function isAIRelated(story: HNStory): boolean {
  const text = story.title.toLowerCase();
  return AI_KEYWORDS.some(keyword => text.includes(keyword));
}
```

**Implementation:**
```typescript
interface HNStory {
  id: number;
  title: string;
  url?: string;      // External link (may be empty for Ask HN)
  score: number;
  by: string;        // Author
  time: number;      // Unix timestamp
  descendants: number; // Comment count
}

export class HackerNewsScraper {
  private readonly HN_API = 'https://hacker-news.firebaseio.com';

  async fetchFromSource(_source: any, maxItems: number) {
    // Get top story IDs
    const idsResponse = await fetch(`${this.HN_API}/v0/topstories.json`);
    const ids: number[] = await idsResponse.json();

    // Fetch details for top N stories
    const stories = await Promise.all(
      ids.slice(0, maxItems).map(async (id) => {
        const response = await fetch(`${this.HN_API}/v0/item/${id}.json`);
        return response.json() as Promise<HNStory>;
      })
    );

    // Filter to AI-related stories only
    return stories
      .filter(story => story && story.url && this.isAIRelated(story))
      .map(story => ({
        title: story.title,
        url: story.url!,
        publishedAt: new Date(story.time * 1000),
        guid: String(story.id),
        score: story.score,
      }));
  }

  private isAIRelated(story: HNStory): boolean {
    const text = story.title.toLowerCase();
    return AI_KEYWORDS.some(keyword => text.includes(keyword));
  }
}
```

**Dependencies:** None - uses native `fetch`

---

### Reddit (V1)

Per TECHNICAL_REQUIREMENTS.md Section: V1: Reddit Pipeline

**Data Source:** Reddit JSON API (append `.json` to any URL)

**Target Subreddits:**
| Subreddit | Focus |
|-----------|-------|
| r/MachineLearning | Research papers, industry news |
| r/artificial | General AI discussion |
| r/LocalLLaMA | Open-source LLMs |
| r/singularity | AI future/AGI discussion |

**Rate Limits:** 60 requests/minute (1 second delay between requests)

**Required Headers:**
```typescript
headers: {
  'User-Agent': 'AITrendsTracker/1.0'  // Required by Reddit
}
```

**Implementation:**
```typescript
interface RedditPost {
  id: string;
  title: string;
  url: string;
  selftext: string;       // Post body (for text posts)
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  permalink: string;
}

export class RedditScraper {
  private readonly SUBREDDITS = ['MachineLearning', 'artificial', 'LocalLLaMA'];
  private readonly REDDIT_DELAY_MS = 1000;  // Rate limit: 60 req/min

  async fetchFromSource(_source: any, maxItems: number) {
    const allPosts: RedditPost[] = [];

    for (const subreddit of this.SUBREDDITS) {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/hot.json?limit=${Math.ceil(maxItems / this.SUBREDDITS.length)}`,
        {
          headers: {
            'User-Agent': 'AITrendsTracker/1.0'
          }
        }
      );

      const data = await response.json();
      const posts = data.data.children.map((child: any) => child.data);
      allPosts.push(...posts);

      // Rate limiting between subreddit requests
      await new Promise(resolve => setTimeout(resolve, this.REDDIT_DELAY_MS));
    }

    return allPosts.slice(0, maxItems).map(post => ({
      title: post.title,
      url: post.url.includes('reddit.com') ? `https://reddit.com${post.permalink}` : post.url,
      publishedAt: new Date(post.created_utc * 1000),
      guid: post.id,
      selftext: post.selftext,
      score: post.score,
    }));
  }

  /**
   * For Reddit, extract content based on post type
   * Per TECHNICAL_REQUIREMENTS.md
   */
  async extractContent(post: { selftext?: string; url: string }): Promise<string | null> {
    if (post.selftext && post.selftext.length > 100) {
      // Text post - use body directly
      return post.selftext;
    } else if (post.url && !post.url.includes('reddit.com')) {
      // Link post - scrape the linked article
      const article = await extract(post.url);
      return article?.content || null;
    }
    return null;
  }
}
```

**Dependencies:** None - uses native `fetch` + existing article extractor

---

## Error Handling Patterns

Per TECHNICAL_REQUIREMENTS.md error handling requirements:

```typescript
import { logger } from '../utils/logger';

export class ScraperErrorHandler {
  /**
   * Handle network errors with appropriate logging
   */
  static handleNetworkError(scraperName: string, error: any, url: string): void {
    if (error.code === 'ENOTFOUND') {
      logger.error(`[${scraperName}] DNS lookup failed for ${url}`);
    } else if (error.code === 'ETIMEDOUT') {
      logger.error(`[${scraperName}] Connection timeout for ${url}`);
    } else if (error.response?.status === 429) {
      logger.warn(`[${scraperName}] Rate limited, implementing backoff`);
    } else if (error.response?.status >= 500) {
      logger.error(`[${scraperName}] Server error ${error.response.status} for ${url}`);
    } else {
      logger.error(`[${scraperName}] Network error: ${error.message}`);
    }
  }

  /**
   * Exponential backoff for retries
   * Per TECHNICAL_REQUIREMENTS.md: max 3 attempts for Claude API errors
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    baseDelayMs = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        if (attempt < maxAttempts) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}

// Usage in scraper:
async scrape(maxItems: number) {
  try {
    const items = await ScraperErrorHandler.withRetry(
      () => this.fetchFromSource(source, maxItems),
      3,
      1000
    );
    // ...
  } catch (error: any) {
    ScraperErrorHandler.handleNetworkError(this.name, error, source.feedUrl);
    throw error;
  }
}
```

---

## Integration with Summarizer Service

After scraping, articles should be passed to the summarizer:

```typescript
// In scraper.service.ts or refresh.controller.ts
import { summarizeArticle } from './summarizer.service';

async function processScrapedArticles(articles: ScrapedArticle[]) {
  for (const article of articles) {
    // Store article first
    const saved = await prisma.article.create({
      data: {
        sourceId: source.id,
        title: article.title,
        url: article.url,
        contentHash: article.contentHash,
        publishedAt: article.publishedAt,
        type: 'article',  // or 'video' for YouTube
      }
    });

    // Queue for summarization if content available
    if (article.content) {
      try {
        const summary = await summarizeArticle(article.content);
        await prisma.article.update({
          where: { id: saved.id },
          data: {
            summary,
            summarizedAt: new Date(),
          }
        });
      } catch (error) {
        // Per TECHNICAL_REQUIREMENTS.md: Retry with exponential backoff, max 3 attempts
        logger.error(`Failed to summarize article ${saved.id}: ${error}`);
      }
    }
  }
}
```

---

## Testing the Scraper

```bash
# Run unit tests for specific scraper
cd backend
npm test -- $0.scraper

# Run all scraper tests
npm test -- --grep "Scraper"

# Manual integration test
cat > test-$0-scraper.ts << 'EOF'
import { $0Scraper } from './src/services/$0.scraper';

async function test() {
  const scraper = new $0Scraper();

  console.log('Can scrape:', scraper.canScrape());

  if (!scraper.canScrape()) {
    console.error('Missing required configuration');
    process.exit(1);
  }

  console.log('Starting scrape...');
  const results = await scraper.scrape(5);

  console.log(`\nScraped ${results.length} items:`);
  results.forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.title}`);
    console.log(`   URL: ${r.url}`);
    console.log(`   Hash: ${r.contentHash.slice(0, 16)}...`);
    console.log(`   Content: ${r.content?.slice(0, 100) || 'N/A'}...`);
  });
}

test().catch(console.error);
EOF

npx tsx test-$0-scraper.ts
rm test-$0-scraper.ts
```

---

## Checklist Before PR

- [ ] Scraper file created at `backend/src/services/$0.scraper.ts`
- [ ] Test file created at `backend/tests/services/$0.scraper.test.ts`
- [ ] Registered in `backend/src/services/scraper.service.ts`
- [ ] Source added to `backend/prisma/seed.ts`
- [ ] Environment variables documented (if any)
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Manual test returns real data
- [ ] Deduplication verified (run twice)
- [ ] Rate limiting verified
- [ ] Fetch tracking records created

---

## Commit Message

```
feat(scraper): add $0 $1 scraper

- Implement $0Scraper for $1 source type
- Add SHA-256 deduplication per content pipeline spec
- Include fetch tracking integration
- Add comprehensive test coverage
```
