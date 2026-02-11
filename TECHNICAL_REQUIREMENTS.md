# AI Trends Tracker - Technical Requirements

## Tech Stack Overview

| Layer      | Technology                     | Purpose                       |
| ---------- | ------------------------------ | ----------------------------- |
| Language   | TypeScript                     | Type safety across full stack |
| Frontend   | React + Vite                   | Fast, modern UI development   |
| Backend    | Node.js + Express.js           | REST API server               |
| Database   | PostgreSQL (Supabase)          | Relational data storage       |
| ORM        | Prisma                         | Type-safe database access     |
| Styling    | Tailwind CSS                   | Utility-first CSS framework   |
| State      | TanStack Query                 | Server state & caching        |
| Validation | Zod                            | Runtime schema validation     |
| Testing    | Vitest + React Testing Library | Unit & integration tests      |
| AI         | Claude 3.5 Haiku (Anthropic)   | Article summarization         |
| Deployment | Vercel + Supabase              | Hosting & managed database    |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vercel)                       │
│                                                                 │
│   React + Vite + Tailwind CSS + TanStack Query                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Vercel)                       │
│                                                                 │
│   Express.js + Zod Validation                                   │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│   │  Articles   │  │   Sources   │  │   Scraper   │             │
│   │  Controller │  │  Controller │  │   Service   │             │
│   └─────────────┘  └─────────────┘  └─────────────┘             │
│                                            │                    │
│                                            ▼                    │
│                                   ┌─────────────────┐           │
│                                   │  Claude API     │           │
│                                   │  (Anthropic)    │           │
│                                   └─────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Prisma Client
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE (Supabase)                         │
│                                                                 │
│   PostgreSQL                                                    │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│   │ articles │  │ sources  │  │ fetches  │                      │
│   └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Content Pipeline

### RSS feeds (MVP)

### Overview

```
┌──────────┐    ┌──────────┐    ┌───────────┐    ┌─────────┐    ┌─────────┐
│   RSS    │───▶│  Parse   │───▶│  Scrape   │───▶│  Store  │───▶│Summarize│
│  Feeds   │    │   XML    │    │  Article  │    │   DB    │    │ Claude  │
└──────────┘    └──────────┘    └───────────┘    └─────────┘    └─────────┘
```

### Step 1: RSS Feed Parsing

Use `rss-parser` to fetch and parse RSS feeds from configured sources.

```typescript
import Parser from "rss-parser";

const parser = new Parser();
const feed = await parser.parseURL(source.feedUrl);

// Returns: title, link, pubDate, contentSnippet, guid
```

### Step 2: Article Scraping

Use `@extractus/article-extractor` to fetch full article content from URLs.

```typescript
import { extract } from "@extractus/article-extractor";

const article = await extract(articleUrl);

// Returns:
// - title: string
// - content: string (HTML cleaned to text)
// - author: string
// - published: string (ISO date)
// - description: string
```

### Step 3: Deduplication

Hash article content to prevent duplicates across fetches:

```typescript
import { createHash } from "crypto";

const contentHash = createHash("sha256")
  .update(article.url + article.title)
  .digest("hex");

// Check if hash exists in DB before inserting
```

### Step 4: AI Summarization

Send extracted content to Claude for summarization:

```typescript
const summary = await summarizer.summarize(article.content);

// Update article record with summary
await prisma.article.update({
  where: { id: article.id },
  data: { summary, summarizedAt: new Date() },
});
```

### Error Handling

| Scenario             | Handling                                                |
| -------------------- | ------------------------------------------------------- |
| RSS feed unavailable | Log error, skip source, continue with others            |
| Article scrape fails | Store article without full content, use RSS description |
| Claude API error     | Retry with exponential backoff, max 3 attempts          |
| Duplicate article    | Skip silently (expected behavior)                       |

### Rate Limiting

- **RSS fetches**: No limit needed (our servers to RSS feeds)
- **Article scraping**: 1 request/second per domain (polite crawling)
- **Claude API**: Built-in rate limiting via SDK, queue if needed

---

## V1: YouTube Pipeline

> **Note:** This is planned for V1, not MVP. Documented here for future reference.

### Overview

```
┌──────────┐    ┌──────────┐    ┌───────────┐    ┌─────────┐    ┌─────────┐
│ YouTube  │───▶│  Fetch   │───▶│  Extract  │───▶│  Store  │───▶│Summarize│
│ Channels │    │ Metadata │    │Transcript │    │   DB    │    │ Claude  │
└──────────┘    └──────────┘    └───────────┘    └─────────┘    └─────────┘
```

### Target Channels

| Channel           | Focus                              |
| ----------------- | ---------------------------------- |
| Two Minute Papers | AI research paper breakdowns       |
| Andrej Karpathy   | Deep learning tutorials & insights |
| Yannic Kilcher    | ML paper reviews                   |
| AI Explained      | AI news and explainers             |

### Step 1: Fetch Video Metadata

Use YouTube Data API v3 to get recent videos from channels.

```typescript
// Required: YOUTUBE_API_KEY in environment
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

async function getChannelVideos(channelId: string, maxResults = 10) {
  const response = await fetch(
    `${YOUTUBE_API_URL}/search?` +
      `key=${process.env.YOUTUBE_API_KEY}&` +
      `channelId=${channelId}&` +
      `part=snippet&` +
      `order=date&` +
      `maxResults=${maxResults}&` +
      `type=video`,
  );

  return response.json();
  // Returns: videoId, title, description, publishedAt, channelTitle
}
```

### Step 2: Extract Transcript

Use `youtube-transcript` package to fetch auto-generated captions.

```typescript
import { YoutubeTranscript } from "youtube-transcript";

async function getTranscript(videoId: string): Promise<string | null> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // Combine all segments into single text
    return transcript.map((segment) => segment.text).join(" ");
  } catch (error) {
    // Some videos don't have transcripts
    console.warn(`No transcript for video ${videoId}`);
    return null;
  }
}
```

### Step 3: Store & Summarize

Same flow as RSS articles - store in `articles` table with `type: 'youtube'`.

```typescript
await prisma.article.create({
  data: {
    sourceId: youtubeSource.id,
    title: video.title,
    url: `https://youtube.com/watch?v=${video.videoId}`,
    contentHash: hash(video.videoId),
    publishedAt: new Date(video.publishedAt),
    type: "youtube", // V1: Add content type field
  },
});

// Then summarize transcript with Claude
const summary = await summarizer.summarize(transcript);
```

### YouTube API Quotas

| Operation              | Quota Cost | Daily Limit (Free)  |
| ---------------------- | ---------- | ------------------- |
| Search (list videos)   | 100 units  | 10,000 units/day    |
| Videos (get details)   | 1 unit     | 10,000 units/day    |
| Captions (via package) | 0 units    | No limit (scraping) |

**Estimated usage:** ~4 channels × 10 videos × 100 units = 4,000 units/refresh (well under limit)

### Environment Variables (V1)

```env
# YouTube Data API
YOUTUBE_API_KEY=AIza...
```

### Dependencies (V1)

```json
{
  "youtube-transcript": "^1.x"
}
```

### Error Handling (YouTube-specific)

| Scenario                 | Handling                                                      |
| ------------------------ | ------------------------------------------------------------- |
| No transcript available  | Store video without summary, mark as `transcript_unavailable` |
| API quota exceeded       | Log error, skip YouTube fetch, continue with RSS              |
| Video is private/deleted | Skip silently                                                 |
| Non-English transcript   | Accept (Claude handles multilingual)                          |

---

## V1: Hacker News Pipeline

> **Note:** This is planned for V1, not MVP.

### Overview

```
┌──────────┐    ┌──────────┐    ┌───────────┐    ┌─────────┐    ┌─────────┐
│ HN API   │───▶│  Filter  │───▶│  Fetch    │───▶│  Store  │───▶│Summarize│
│Top/Best  │    │ AI Posts │    │  Article  │    │   DB    │    │ Claude  │
└──────────┘    └──────────┘    └───────────┘    └─────────┘    └─────────┘
```

### Data Source

Hacker News provides a free, no-auth API.

| Endpoint               | Description              |
| ---------------------- | ------------------------ |
| `/v0/topstories.json`  | Top 500 story IDs        |
| `/v0/beststories.json` | Best stories             |
| `/v0/item/{id}.json`   | Individual story details |

### Implementation

```typescript
const HN_API = "https://hacker-news.firebaseio.com";

interface HNStory {
  id: number;
  title: string;
  url?: string; // External link (may be empty for Ask HN)
  score: number;
  by: string; // Author
  time: number; // Unix timestamp
  descendants: number; // Comment count
}

async function fetchTopStories(limit = 30): Promise<HNStory[]> {
  // Get top story IDs
  const ids = await fetch(`${HN_API}/v0/topstories.json`).then((r) => r.json());

  // Fetch details for top N stories
  const stories = await Promise.all(
    ids
      .slice(0, limit)
      .map((id: number) =>
        fetch(`${HN_API}/v0/item/${id}.json`).then((r) => r.json()),
      ),
  );

  return stories;
}
```

### AI Filtering

Filter stories to only include AI-related content:

```typescript
const AI_KEYWORDS = [
  "ai",
  "artificial intelligence",
  "machine learning",
  "ml",
  "llm",
  "gpt",
  "claude",
  "openai",
  "anthropic",
  "neural",
  "deep learning",
  "transformer",
  "diffusion",
  "generative",
  "chatbot",
  "nlp",
];

function isAIRelated(story: HNStory): boolean {
  const text = story.title.toLowerCase();
  return AI_KEYWORDS.some((keyword) => text.includes(keyword));
}
```

### Dependencies (V1)

No additional dependencies - uses native `fetch`.

---

## V1: Reddit Pipeline

> **Note:** This is planned for V1, not MVP.

### Overview

```
┌──────────┐    ┌──────────┐    ┌───────────┐    ┌─────────┐    ┌─────────┐
│ Reddit   │───▶│  Parse   │───▶│  Extract  │───▶│  Store  │───▶│Summarize│
│ JSON API │    │  Posts   │    │  Content  │    │   DB    │    │ Claude  │
└──────────┘    └──────────┘    └───────────┘    └─────────┘    └─────────┘
```

### Target Subreddits

| Subreddit         | Focus                          |
| ----------------- | ------------------------------ |
| r/MachineLearning | Research papers, industry news |
| r/artificial      | General AI discussion          |
| r/LocalLLaMA      | Open-source LLMs               |
| r/singularity     | AI future/AGI discussion       |

### Data Source

Reddit provides JSON endpoints by appending `.json` to any URL.

```typescript
const SUBREDDITS = ["MachineLearning", "artificial", "LocalLLaMA"];

interface RedditPost {
  id: string;
  title: string;
  url: string;
  selftext: string; // Post body (for text posts)
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  permalink: string;
}

async function fetchSubredditPosts(
  subreddit: string,
  limit = 25,
): Promise<RedditPost[]> {
  const response = await fetch(
    `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
    {
      headers: {
        "User-Agent": "AITrendsTracker/1.0", // Required by Reddit
      },
    },
  );

  const data = await response.json();
  return data.data.children.map((child: any) => child.data);
}
```

### Content Extraction

For link posts, scrape the linked article. For text posts, use the selftext.

```typescript
async function getPostContent(post: RedditPost): Promise<string> {
  if (post.selftext && post.selftext.length > 100) {
    // Text post - use body directly
    return post.selftext;
  } else if (post.url && !post.url.includes("reddit.com")) {
    // Link post - scrape article
    const article = await extract(post.url);
    return article?.content || post.title;
  }
  return post.title;
}
```

### Rate Limiting

Reddit rate limits to ~60 requests/minute. Implement delays:

```typescript
const REDDIT_DELAY_MS = 1000; // 1 second between requests

async function fetchAllSubreddits(): Promise<RedditPost[]> {
  const allPosts: RedditPost[] = [];

  for (const subreddit of SUBREDDITS) {
    const posts = await fetchSubredditPosts(subreddit);
    allPosts.push(...posts);
    await sleep(REDDIT_DELAY_MS);
  }

  return allPosts;
}
```

### Dependencies (V1)

No additional dependencies - uses native `fetch` + existing article extractor.

---

## V1: Automated Refresh (Cron Jobs)

> **Note:** This is planned for V1, not MVP. MVP uses manual refresh only.

### Overview

Automatically fetch new content every 6 hours without user intervention.

### Implementation Options

| Platform     | Method         | Notes                                |
| ------------ | -------------- | ------------------------------------ |
| **Vercel**   | Cron Jobs      | Built-in, configure in `vercel.json` |
| **Supabase** | pg_cron        | Database-level scheduling            |
| **External** | GitHub Actions | Free, runs on schedule               |

### Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/refresh",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Cron Endpoint

```typescript
// src/routes/cron.ts
import { refreshAllSources } from "../services/scraper.service";

export async function handleCronRefresh(req: Request, res: Response) {
  // Verify request is from Vercel Cron
  const authHeader = req.headers["authorization"];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await refreshAllSources();
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ error: "Refresh failed" });
  }
}
```

### Environment Variables (V1)

```env
# Cron authentication
CRON_SECRET=your-secret-here
```

### Schedule Options

| Schedule      | Cron Expression | Description             |
| ------------- | --------------- | ----------------------- |
| Every 6 hours | `0 */6 * * *`   | Default (PRODUCT_SPECS) |
| Every 4 hours | `0 */4 * * *`   | More frequent           |
| Twice daily   | `0 8,20 * * *`  | Morning & evening       |

---

## V2: Search Functionality

> **Note:** This is planned for V2, not MVP or V1.

### Overview

Full-text search across article titles and summaries.

### Implementation Options

| Option                          | Pros                          | Cons                    |
| ------------------------------- | ----------------------------- | ----------------------- |
| **PostgreSQL Full-Text Search** | Built-in, no extra cost       | Basic relevance ranking |
| **Supabase Full-Text Search**   | Same as above, easy setup     | Limited customization   |
| **Meilisearch**                 | Fast, typo-tolerant, great UX | Extra service to manage |
| **Algolia**                     | Best-in-class search          | Expensive at scale      |

### Recommended: PostgreSQL Full-Text Search

Simple, free, and sufficient for this use case.

```sql
-- Add search vector column
ALTER TABLE articles ADD COLUMN search_vector tsvector;

-- Create index
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- Update trigger to auto-populate
CREATE FUNCTION update_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.summary, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_search_update
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();
```

### API Endpoint

```typescript
// GET /api/articles/search?q=transformer+architecture

router.get("/articles/search", async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  const articles = await prisma.$queryRaw`
    SELECT *, ts_rank(search_vector, plainto_tsquery('english', ${q})) as rank
    FROM articles
    WHERE search_vector @@ plainto_tsquery('english', ${q})
    ORDER BY rank DESC, published_at DESC
    LIMIT ${limit} OFFSET ${(page - 1) * limit}
  `;

  res.json({ success: true, data: articles });
});
```

### Frontend Component

```typescript
// hooks/useSearch.ts
export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => api.get(`/articles/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2, // Only search with 2+ chars
    staleTime: 60_000, // Cache for 1 minute
  });
}
```

---

## V2: Advanced Filtering

> **Note:** This is planned for V2.

### Filter Options

| Filter       | Type         | Description                      |
| ------------ | ------------ | -------------------------------- |
| Source       | Multi-select | Filter by one or more sources    |
| Content Type | Select       | 'article', 'video', 'discussion' |
| Date Range   | Date picker  | From/to date filter              |
| Category     | Multi-select | News, Research, Tutorial, etc.   |
| Read Status  | Toggle       | Show read/unread articles        |

### API Query Parameters

```
GET /api/articles?source=techcrunch,verge&type=article&from=2026-01-01&category=research&unread=true
```

### Implementation

```typescript
// schemas/article.schemas.ts
const ArticleFilterSchema = z.object({
  source: z.string().optional(), // Comma-separated slugs
  type: z.enum(["article", "video", "discussion"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  category: z.string().optional(), // Comma-separated categories
  unread: z.coerce.boolean().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

// controllers/articles.controller.ts
async function listArticles(req: Request, res: Response) {
  const filters = ArticleFilterSchema.parse(req.query);

  const where: Prisma.ArticleWhereInput = {};

  if (filters.source) {
    where.source = { slug: { in: filters.source.split(",") } };
  }
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.from || filters.to) {
    where.publishedAt = {
      ...(filters.from && { gte: new Date(filters.from) }),
      ...(filters.to && { lte: new Date(filters.to) }),
    };
  }
  if (filters.category) {
    where.category = { in: filters.category.split(",") };
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    skip: (filters.page - 1) * filters.limit,
    take: filters.limit,
  });

  res.json({ success: true, data: articles });
}
```

---

## V2: Content Categories

> **Note:** This is planned for V2.

### Category Taxonomy

| Category | Description                  | Examples                       |
| -------- | ---------------------------- | ------------------------------ |
| News     | Industry news, announcements | Product launches, funding      |
| Research | Academic papers, studies     | arXiv papers, benchmarks       |
| Tutorial | How-to guides, courses       | Coding tutorials, explanations |
| Opinion  | Analysis, commentary         | Blog posts, editorials         |
| Tool     | Software, libraries          | New frameworks, updates        |

### AI-Powered Categorization

Use Claude to automatically categorize articles during summarization.

```typescript
export async function categorizeAndSummarize(content: string) {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `Analyze this AI article and provide:
1. A 2-3 paragraph summary focusing on key points
2. A category from: News, Research, Tutorial, Opinion, Tool

Article:
${content}

Respond in JSON format:
{ "summary": "...", "category": "..." }`,
      },
    ],
  });

  return JSON.parse(response.content[0].text);
}
```

### Database Update

```prisma
model Article {
  // ... existing fields
  category    String?   @db.VarChar(20)  // V2: AI-assigned category

  @@index([category])  // V2: Filter by category
}
```

---

## V2: Dark Mode

> **Note:** This is planned for V2.

### Implementation Approach

Use Tailwind CSS dark mode with system preference detection.

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class", // or 'media' for system-only
  // ...
};
```

### Theme Toggle Component

```typescript
// components/ThemeToggle.tsx
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as typeof theme;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}
```

### Color Scheme

```css
/* Base styles with dark variants */
.card {
  @apply bg-white dark:bg-gray-800;
  @apply text-gray-900 dark:text-gray-100;
  @apply border-gray-200 dark:border-gray-700;
}
```

---

## V2: Bookmarks

> **Note:** This is planned for V2.

### Features

- Save articles for later reading
- Export bookmarks as JSON/CSV
- Stored locally (MVP) or in user account (with auth)

### Local Storage Implementation (No Auth)

```typescript
// hooks/useBookmarks.ts
const STORAGE_KEY = "ai-trends-bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setBookmarks(JSON.parse(stored));
  }, []);

  const addBookmark = (articleId: string) => {
    const updated = [...bookmarks, articleId];
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeBookmark = (articleId: string) => {
    const updated = bookmarks.filter((id) => id !== articleId);
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const isBookmarked = (articleId: string) => bookmarks.includes(articleId);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
```

### Export Functionality

```typescript
// utils/export.ts
export function exportBookmarks(articles: Article[], format: "json" | "csv") {
  if (format === "json") {
    const blob = new Blob([JSON.stringify(articles, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, "bookmarks.json");
  } else {
    const csv = [
      ["Title", "URL", "Source", "Date"].join(","),
      ...articles.map((a) =>
        [a.title, a.url, a.source.name, a.publishedAt].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, "bookmarks.csv");
  }
}
```

---

## V2: User Accounts

> **Note:** This is planned for V2. Enables cloud sync for bookmarks and read status.

### Authentication Options

| Provider          | Pros                          | Cons                 |
| ----------------- | ----------------------------- | -------------------- |
| **Supabase Auth** | Integrated with DB, free tier | Vendor lock-in       |
| **NextAuth.js**   | Flexible, many providers      | More setup           |
| **Clerk**         | Great DX, pre-built UI        | Paid after free tier |

### Recommended: Supabase Auth

Already using Supabase for DB - auth is included free.

### Database Schema (V2)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now()) @map("created_at")

  bookmarks Bookmark[]
  readHistory ReadHistory[]

  @@map("users")
}

model Bookmark {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  articleId String   @map("article_id")
  createdAt DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId], references: [id])
  article Article @relation(fields: [articleId], references: [id])

  @@unique([userId, articleId])
  @@map("bookmarks")
}

model ReadHistory {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  articleId String   @map("article_id")
  readAt    DateTime @default(now()) @map("read_at")

  user    User    @relation(fields: [userId], references: [id])
  article Article @relation(fields: [articleId], references: [id])

  @@unique([userId, articleId])
  @@map("read_history")
}
```

### API Endpoints (V2)

| Method | Endpoint                  | Description          |
| ------ | ------------------------- | -------------------- |
| POST   | `/api/auth/signup`        | Create account       |
| POST   | `/api/auth/login`         | Login                |
| POST   | `/api/auth/logout`        | Logout               |
| GET    | `/api/user/bookmarks`     | Get user's bookmarks |
| POST   | `/api/user/bookmarks/:id` | Add bookmark         |
| DELETE | `/api/user/bookmarks/:id` | Remove bookmark      |
| POST   | `/api/user/read/:id`      | Mark article as read |

### Supabase Auth Integration

```typescript
// services/auth.service.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}
```

---

## Database Schema

### Tables

#### `sources`

Stores content sources (RSS feeds, YouTube channels).

| Column      | Type         | Constraints                    | Description                             |
| ----------- | ------------ | ------------------------------ | --------------------------------------- |
| id          | UUID         | PK, DEFAULT uuid_generate_v4() | Unique identifier                       |
| name        | VARCHAR(100) | NOT NULL, UNIQUE               | Display name (e.g., "TechCrunch AI")    |
| slug        | VARCHAR(50)  | NOT NULL, UNIQUE               | URL-safe identifier                     |
| type        | VARCHAR(20)  | NOT NULL, DEFAULT 'rss'        | Source type: 'rss', 'youtube' (V1)      |
| feed_url    | TEXT         | NULL                           | RSS feed URL (for type='rss')           |
| channel_id  | VARCHAR(50)  | NULL                           | YouTube channel ID (V1, type='youtube') |
| website_url | TEXT         | NOT NULL                       | Source website/channel URL              |
| is_active   | BOOLEAN      | DEFAULT true                   | Enable/disable source                   |
| created_at  | TIMESTAMP    | DEFAULT NOW()                  | Record creation time                    |
| updated_at  | TIMESTAMP    | DEFAULT NOW()                  | Last update time                        |

#### `articles`

Stores aggregated content (articles, videos) with AI summaries.

| Column        | Type         | Constraints                    | Description                      |
| ------------- | ------------ | ------------------------------ | -------------------------------- |
| id            | UUID         | PK, DEFAULT uuid_generate_v4() | Unique identifier                |
| source_id     | UUID         | FK → sources.id, NOT NULL      | Reference to source              |
| type          | VARCHAR(20)  | NOT NULL, DEFAULT 'article'    | Content type: 'article', 'video' |
| title         | VARCHAR(500) | NOT NULL                       | Article/video title              |
| url           | TEXT         | NOT NULL, UNIQUE               | Original URL                     |
| summary       | TEXT         | NULL                           | AI-generated summary             |
| category      | VARCHAR(20)  | NULL                           | V2: AI-assigned category         |
| content_hash  | VARCHAR(64)  | NOT NULL                       | SHA-256 hash for deduplication   |
| search_vector | TSVECTOR     | NULL                           | V2: Full-text search index       |
| published_at  | TIMESTAMP    | NOT NULL                       | Original publish date            |
| fetched_at    | TIMESTAMP    | DEFAULT NOW()                  | When content was fetched         |
| summarized_at | TIMESTAMP    | NULL                           | When summary was generated       |
| created_at    | TIMESTAMP    | DEFAULT NOW()                  | Record creation time             |

#### `fetches`

Tracks fetch operations for monitoring and debugging.

| Column         | Type        | Constraints                    | Description                                 |
| -------------- | ----------- | ------------------------------ | ------------------------------------------- |
| id             | UUID        | PK, DEFAULT uuid_generate_v4() | Unique identifier                           |
| source_id      | UUID        | FK → sources.id, NULL          | NULL = all sources                          |
| status         | VARCHAR(20) | NOT NULL                       | 'pending', 'running', 'completed', 'failed' |
| articles_found | INTEGER     | DEFAULT 0                      | Total articles in feed                      |
| articles_new   | INTEGER     | DEFAULT 0                      | New articles added                          |
| error_message  | TEXT        | NULL                           | Error details if failed                     |
| started_at     | TIMESTAMP   | DEFAULT NOW()                  | Fetch start time                            |
| completed_at   | TIMESTAMP   | NULL                           | Fetch completion time                       |

#### `users` (V2)

Stores user accounts for bookmarks and read history.

| Column     | Type         | Constraints                    | Description       |
| ---------- | ------------ | ------------------------------ | ----------------- |
| id         | UUID         | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| email      | VARCHAR(255) | NOT NULL, UNIQUE               | User email        |
| created_at | TIMESTAMP    | DEFAULT NOW()                  | Account creation  |

#### `bookmarks` (V2)

Stores user bookmarked articles.

| Column     | Type      | Constraints                    | Description          |
| ---------- | --------- | ------------------------------ | -------------------- |
| id         | UUID      | PK, DEFAULT uuid_generate_v4() | Unique identifier    |
| user_id    | UUID      | FK → users.id, NOT NULL        | Reference to user    |
| article_id | UUID      | FK → articles.id, NOT NULL     | Reference to article |
| created_at | TIMESTAMP | DEFAULT NOW()                  | Bookmark creation    |

**Constraints:** UNIQUE(user_id, article_id)

#### `read_history` (V2)

Tracks which articles users have read.

| Column     | Type      | Constraints                    | Description           |
| ---------- | --------- | ------------------------------ | --------------------- |
| id         | UUID      | PK, DEFAULT uuid_generate_v4() | Unique identifier     |
| user_id    | UUID      | FK → users.id, NOT NULL        | Reference to user     |
| article_id | UUID      | FK → articles.id, NOT NULL     | Reference to article  |
| read_at    | TIMESTAMP | DEFAULT NOW()                  | When article was read |

**Constraints:** UNIQUE(user_id, article_id)

### Indexes

```sql
-- MVP indexes
CREATE INDEX idx_articles_source_id ON articles(source_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_content_hash ON articles(content_hash);
CREATE INDEX idx_fetches_status ON fetches(status);

-- V1 indexes
CREATE INDEX idx_articles_type ON articles(type);

-- V2 indexes
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_read_history_user_id ON read_history(user_id);
```

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Source {
  id         String    @id @default(uuid())
  name       String    @unique @db.VarChar(100)
  slug       String    @unique @db.VarChar(50)
  type       String    @default("rss") @db.VarChar(20)  // 'rss' | 'youtube'
  feedUrl    String?   @map("feed_url")                 // For RSS sources
  channelId  String?   @map("channel_id") @db.VarChar(50) // V1: For YouTube sources
  websiteUrl String    @map("website_url")
  isActive   Boolean   @default(true) @map("is_active")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  articles   Article[]
  fetches    Fetch[]

  @@map("sources")
}

model Article {
  id           String    @id @default(uuid())
  sourceId     String    @map("source_id")
  type         String    @default("article") @db.VarChar(20)  // 'article' | 'video'
  title        String    @db.VarChar(500)
  url          String    @unique
  summary      String?
  category     String?   @db.VarChar(20)  // V2: AI-assigned category
  contentHash  String    @map("content_hash") @db.VarChar(64)
  publishedAt  DateTime  @map("published_at")
  fetchedAt    DateTime  @default(now()) @map("fetched_at")
  summarizedAt DateTime? @map("summarized_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  source       Source    @relation(fields: [sourceId], references: [id])
  bookmarks    Bookmark[]    // V2
  readHistory  ReadHistory[] // V2

  @@index([sourceId])
  @@index([publishedAt(sort: Desc)])
  @@index([contentHash])
  @@index([type])      // V1: Filter by content type
  @@index([category])  // V2: Filter by category
  @@map("articles")
}

model Fetch {
  id            String    @id @default(uuid())
  sourceId      String?   @map("source_id")
  status        String    @db.VarChar(20)
  articlesFound Int       @default(0) @map("articles_found")
  articlesNew   Int       @default(0) @map("articles_new")
  errorMessage  String?   @map("error_message")
  startedAt     DateTime  @default(now()) @map("started_at")
  completedAt   DateTime? @map("completed_at")

  source        Source?   @relation(fields: [sourceId], references: [id])

  @@index([status])
  @@map("fetches")
}

// ============================================
// V2 Models - User Accounts & Features
// ============================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique @db.VarChar(255)
  createdAt DateTime @default(now()) @map("created_at")

  bookmarks   Bookmark[]
  readHistory ReadHistory[]

  @@map("users")
}

model Bookmark {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  articleId String   @map("article_id")
  createdAt DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
  @@index([userId])
  @@map("bookmarks")
}

model ReadHistory {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  articleId String   @map("article_id")
  readAt    DateTime @default(now()) @map("read_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
  @@index([userId])
  @@map("read_history")
}
```

---

## API Endpoints

### Articles (MVP)

| Method | Endpoint            | Description                     | Query Params              |
| ------ | ------------------- | ------------------------------- | ------------------------- |
| GET    | `/api/articles`     | List articles (paginated)       | `source`, `page`, `limit` |
| GET    | `/api/articles/:id` | Get single article with summary | -                         |

### Sources (MVP)

| Method | Endpoint       | Description             |
| ------ | -------------- | ----------------------- |
| GET    | `/api/sources` | List all active sources |

### Refresh (MVP)

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| POST   | `/api/refresh`        | Trigger manual content refresh |
| GET    | `/api/refresh/status` | Get latest fetch status        |

### Cron (V1)

| Method | Endpoint            | Description                     |
| ------ | ------------------- | ------------------------------- |
| POST   | `/api/cron/refresh` | Automated refresh (Vercel Cron) |

### Search (V2)

| Method | Endpoint               | Description      | Query Params         |
| ------ | ---------------------- | ---------------- | -------------------- |
| GET    | `/api/articles/search` | Full-text search | `q`, `page`, `limit` |

### Advanced Filtering (V2)

Extended query params for `/api/articles`:

| Param    | Type   | Description                            |
| -------- | ------ | -------------------------------------- |
| source   | string | Comma-separated source slugs           |
| type     | string | 'article', 'video', 'discussion'       |
| category | string | Comma-separated categories             |
| from     | string | ISO date - filter from this date       |
| to       | string | ISO date - filter to this date         |
| unread   | bool   | Filter unread articles (requires auth) |

### Auth (V2)

| Method | Endpoint           | Description      |
| ------ | ------------------ | ---------------- |
| POST   | `/api/auth/signup` | Create account   |
| POST   | `/api/auth/login`  | Login            |
| POST   | `/api/auth/logout` | Logout           |
| GET    | `/api/auth/me`     | Get current user |

### User Features (V2)

| Method | Endpoint                  | Description          |
| ------ | ------------------------- | -------------------- |
| GET    | `/api/user/bookmarks`     | Get user's bookmarks |
| POST   | `/api/user/bookmarks/:id` | Add bookmark         |
| DELETE | `/api/user/bookmarks/:id` | Remove bookmark      |
| POST   | `/api/user/read/:id`      | Mark as read         |
| GET    | `/api/user/export`        | Export bookmarks     |

### Response Formats

**Success Response:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Paginated Response:**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid source parameter"
  }
}
```

---

## Project Structure

```
ai-trends-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── articles.controller.ts
│   │   │   ├── sources.controller.ts
│   │   │   └── refresh.controller.ts
│   │   ├── services/
│   │   │   ├── scraper.service.ts
│   │   │   ├── summarizer.service.ts
│   │   │   └── rss.service.ts
│   │   ├── middleware/
│   │   │   ├── error.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── schemas/
│   │   │   └── api.schemas.ts       # Zod schemas
│   │   ├── utils/
│   │   │   ├── hash.ts
│   │   │   └── logger.ts
│   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   │   ├── controllers/
│   │   └── services/
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── ArticleGrid.tsx
│   │   │   ├── ArticleModal.tsx
│   │   │   ├── SourceFilter.tsx
│   │   │   ├── RefreshButton.tsx
│   │   │   └── Header.tsx
│   │   ├── hooks/
│   │   │   ├── useArticles.ts
│   │   │   ├── useSources.ts
│   │   │   └── useRefresh.ts
│   │   ├── services/
│   │   │   └── api.ts               # API client
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── tests/
│   │   └── components/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── tailwind.config.js
│
├── .env.example
├── .gitignore
├── README.md
├── PRODUCT_SPECS.md
├── PROJECT_PLAN.md
└── TECHNICAL_REQUIREMENTS.md
```

---

## Environment Variables

### Backend

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...

# Server
PORT=3001
NODE_ENV=development
```

### Frontend

```env
# API URL
VITE_API_URL=http://localhost:3001/api
```

---

## External Dependencies

### Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.x",
    "@prisma/client": "^5.x",
    "@anthropic-ai/sdk": "^0.x",
    "@extractus/article-extractor": "^8.x",
    "rss-parser": "^3.x",
    "zod": "^3.x",
    "cors": "^2.x",
    "helmet": "^7.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "prisma": "^5.x",
    "vitest": "^1.x",
    "@types/express": "^4.x",
    "@types/cors": "^2.x",
    "tsx": "^4.x"
  }
}
```

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "@tanstack/react-query": "^5.x",
    "axios": "^1.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "vitest": "^1.x",
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x"
  }
}
```

---

## Development Setup

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- Supabase account (free tier)

### Database Setup (Supabase)

We use Supabase for both local development and production. No local PostgreSQL installation required.

**Step 1: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose a name (e.g., `ai-trends-tracker`)
4. Set a database password (save this!)
5. Select region closest to you
6. Click "Create new project"

**Step 2: Get Connection String**

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll to "Connection string" section
3. Select "URI" tab
4. Copy the connection string (looks like: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`)
5. Replace `[YOUR-PASSWORD]` with your database password

**Step 3: Configure Environment**

```bash
# In backend/.env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

> **Note:** Supabase uses connection pooling. Use port `6543` for pooled connections (app) and port `5432` for direct connections (migrations).

### Local Development

```bash
# Clone repository
git clone <repo-url>
cd ai-trends-tracker

# Backend setup
cd backend
npm install
cp .env.example .env          # Add your Supabase DATABASE_URL
npx prisma generate           # Generate Prisma client
npx prisma db push            # Push schema to Supabase
npx prisma db seed            # Seed initial RSS sources
npm run dev                   # Start dev server on :3001

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env          # Configure API URL
npm run dev                   # Start dev server on :5173
```

### Useful Prisma Commands

```bash
npx prisma studio             # Open visual database browser
npx prisma db push            # Push schema changes to database
npx prisma generate           # Regenerate client after schema changes
npx prisma db seed            # Run seed script
```

---

## Deployment

### Vercel Configuration

**Backend (`vercel.json`):**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

**Frontend:** Auto-detected by Vercel as Vite project.

### Supabase Setup

1. Create new Supabase project
2. Copy connection string to `DATABASE_URL`
3. Run `npx prisma db push` to create tables
4. Run `npx prisma db seed` to seed sources

### Environment Variables (Production)

Set in Vercel dashboard:

- `DATABASE_URL` - Supabase connection string
- `ANTHROPIC_API_KEY` - Claude API key
- `VITE_API_URL` - Production API URL

---

## AI Integration

### Claude API Usage

**Service: `summarizer.service.ts`**

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function summarizeArticle(content: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Summarize this AI news article in 2-3 concise paragraphs. Focus on key developments, implications, and why it matters:\n\n${content}`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
```

### Rate Limiting & Error Handling

- Implement exponential backoff for API failures
- Queue summarization requests to avoid rate limits
- Cache summaries to prevent duplicate API calls

---

## Testing Strategy

### Unit Tests

- Controllers: Test request/response handling
- Services: Test business logic in isolation
- Utils: Test helper functions

### Integration Tests

- API endpoints with test database
- Prisma queries against test data

### Component Tests (Frontend)

- Render components with mock data
- Test user interactions
- Verify TanStack Query integration

### Test Commands

```bash
# Backend
cd backend && npm test           # Run all tests
cd backend && npm run test:watch # Watch mode

# Frontend
cd frontend && npm test          # Run all tests
cd frontend && npm run test:ui   # Vitest UI
```

---

## MCP Servers

Model Context Protocol (MCP) servers extend Claude's capabilities with direct integrations to external services.

### Recommended Servers

| Server           | Purpose                                       | Value                                                        |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------ |
| **Supabase MCP** | Database queries, migrations, type generation | Query DB in natural language, auto-generate TypeScript types |
| **GitHub MCP**   | Repository management, PRs, issues, Actions   | Create PRs, manage issues without leaving Claude             |
| **Vercel MCP**   | Deployment management, logs, env vars         | Monitor deployments, check build logs                        |

### Configuration

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@github/github-mcp-server"]
    }
  }
}
```

> **Note:** Vercel MCP is configured through the Vercel dashboard, not locally.

### Supabase MCP Capabilities

- Natural language database queries
- Generate and run migrations
- Auto-generate TypeScript types from schema
- View project logs for debugging
- Manage database branches

### GitHub MCP Capabilities

- Create and manage pull requests
- Browse code and search files
- Create and update issues
- Monitor GitHub Actions workflows
- Review Dependabot alerts

### Setup Instructions

1. Install MCP servers: Servers auto-install on first use via `npx`
2. Restart Claude Desktop after config changes
3. Verify connection: Look for MCP indicator in bottom-right corner

---

**Document Version:** 1.0
**Last Updated:** 2026-01-31
