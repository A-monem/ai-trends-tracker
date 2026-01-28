# AI Trends Tracker - Implementation Plan

## Project Overview

**AI Trends Tracker** is a full-stack web application that aggregates AI-related news, videos, and discussions from multiple sources and presents them in a clean, digestible format with AI-powered summaries and intelligent categorization.

### Core Value Proposition
- **Single Source of Truth**: Aggregate AI content from 10+ sources in one place
- **AI-Powered Insights**: Claude-generated summaries and categorization
- **Smart Deduplication**: Same story from multiple sources appears once
- **Personalization**: Filter by source, category, and custom preferences
- **Always Up-to-Date**: Automated refresh every 6 hours

### Target MVP Timeline
- **Phase 1** (Days 1-2): Backend + Data Collection
- **Phase 2** (Days 3-4): Frontend + Core UI
- **Phase 3** (Day 5): Polish + Production Deployment

---

## Tech Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime | 18.x+ |
| **TypeScript** | Type safety | 5.x |
| **Express** | API server | 4.x |
| **PostgreSQL** | Primary database (Production) | 15+ |
| **SQLite** | Local development database | 3.x |
| **Drizzle ORM** | Database abstraction | Latest |
| **@anthropic-ai/sdk** | Claude API client | Latest |
| **rss-parser** | RSS feed parsing | Latest |
| **axios** | HTTP client | Latest |
| **cheerio** | HTML parsing | Latest |
| **node-cron** | Scheduled jobs | Latest |
| **zod** | Runtime validation | Latest |
| **winston** | Structured logging | Latest |
| **tsx** | TypeScript execution | Latest |

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 18.x |
| **TypeScript** | Type safety | 5.x |
| **Vite** | Build tool | 5.x |
| **TailwindCSS** | Styling | 3.x |
| **@tanstack/react-query** | Data fetching & caching | 5.x |
| **react-router-dom** | Routing | 6.x |
| **zustand** | State management | 4.x |
| **date-fns** | Date formatting | Latest |
| **lucide-react** | Icons | Latest |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local orchestration |
| **GitHub Actions** | CI/CD |
| **ESLint** | Linting |
| **Prettier** | Code formatting |
| **Vitest** | Unit testing |

---

## MVP Features

### Phase 1: Backend & Data Collection

#### 1.1 Content Aggregation
**News Sources (RSS Feeds):**
- TechCrunch AI Tag
- VentureBeat AI Category
- The Verge AI Section
- MIT Technology Review
- Ars Technica AI
- Wired AI Section

**Video Sources (YouTube API):**
- Two Minute Papers
- Andrej Karpathy
- Lex Fridman (AI interviews only)
- Yannic Kilcher
- AI Explained

**Discussion Sources (APIs):**
- Hacker News (AI-related posts)
- Reddit r/MachineLearning (top posts)
- arXiv CS.AI (recent papers)

**Requirements:**
- Fetch content from all sources every 6 hours
- Graceful error handling (if one source fails, others continue)
- Rate limit compliance for all APIs
- Store raw content before processing

#### 1.2 Content Deduplication
- URL normalization (remove tracking params)
- Title similarity detection (>85% match = duplicate)
- Cross-source duplicate detection
- Keep earliest-published version

#### 1.3 AI Processing (Claude API)
For each unique article:
- **Summary**: 3-4 sentence concise summary
- **Category**: Research | Product | Tutorial | News | Opinion | Breakthrough
- **Key Insights**: 3-5 bullet points
- **Relevance Score**: 1-10 (how relevant to AI practitioners)

**Processing Strategy:**
- Batch processing (10 articles at a time)
- Cache summaries to avoid re-processing
- Fallback to basic extraction if Claude API fails
- Token usage monitoring

#### 1.4 Data Storage
- Store raw content immediately
- Queue for AI processing
- Update with AI insights asynchronously
- Automatic cleanup (delete items >90 days old)

#### 1.5 API Endpoints

**Trends:**
```
GET    /api/trends                    - List trends (paginated, filtered)
GET    /api/trends/:id                - Get single trend details
POST   /api/trends/refresh            - Trigger manual refresh
PATCH  /api/trends/:id/read           - Mark as read/unread
PATCH  /api/trends/:id/bookmark       - Toggle bookmark
GET    /api/trends/export             - Export bookmarked trends (markdown)
```

**Sources:**
```
GET    /api/sources                   - List all sources
GET    /api/sources/status            - Health check for all sources
PATCH  /api/sources/:id/toggle        - Enable/disable source
```

**Stats & Health:**
```
GET    /api/stats                     - Aggregated statistics
GET    /api/health                    - Service health check
GET    /api/categories                - List all categories with counts
```

### Phase 2: Frontend & UI

#### 2.1 Core Pages
**Feed Page (/):**
- Card-based grid layout (responsive: 1/2/3 columns)
- Infinite scroll pagination
- Visual badge for unread items
- Source icon + category badge
- Thumbnail for video content
- Click to open detail modal

**Bookmarks Page (/bookmarks):**
- Same card layout as Feed
- Export to Markdown button
- Clear all bookmarks option

**Settings Page (/settings):**
- Source toggles (enable/disable individual sources)
- Category preferences
- Refresh frequency selector
- Dark mode toggle
- Export data option

#### 2.2 Components

**TrendCard:**
- Props: trend object, onClick handler
- Shows: thumbnail, title, source, category, summary, timestamp
- States: unread (blue border), bookmarked (star icon)
- Hover effects and animations

**TrendModal:**
- Full-screen overlay on mobile, side panel on desktop
- Displays: full summary, key insights, source link, metadata
- Actions: mark as read, bookmark, open original, share
- Keyboard navigation (ESC to close, arrow keys to navigate)

**FilterBar:**
- Source filter (multi-select)
- Category filter (multi-select)
- Search input (debounced)
- Sort dropdown (date, relevance)
- Active filters badge count
- Clear all filters button

**Header:**
- Logo and app name
- Navigation links
- Refresh button (with loading state)
- Unread count badge
- Settings icon

#### 2.3 State Management
**Global State (Zustand):**
- User preferences (sources, categories, theme)
- Active filters
- Bookmarked trend IDs

**Server State (React Query):**
- Trends data (with caching)
- Sources list
- Stats data
- Auto-refetch on window focus
- Optimistic updates for read/bookmark actions

#### 2.4 Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly tap targets (min 44x44px)
- Swipe gestures on mobile (swipe to bookmark/archive)

### Phase 3: Polish & Production

#### 3.1 Performance Optimization
- Code splitting by route
- Lazy load TrendModal
- Image lazy loading with placeholder
- Virtual scrolling for large lists
- Service worker for offline support
- Compress API responses (gzip)

#### 3.2 Error Handling
**Backend:**
- Global error handler middleware
- Graceful degradation (source fails → continue with others)
- Retry logic with exponential backoff
- Rate limit handling
- Structured error logging (Winston)

**Frontend:**
- Error boundaries for components
- Toast notifications for user errors
- Retry failed requests automatically
- Offline indicator
- Fallback UI for failed data loads

#### 3.3 Testing Strategy
**Backend:**
- Unit tests for scrapers (mock API responses)
- Integration tests for API endpoints
- Test AI service with mock Claude responses
- Test deduplication logic

**Frontend:**
- Component tests (Vitest + Testing Library)
- E2E tests for critical flows (optional)
- Visual regression tests (optional)

#### 3.4 Production Deployment
- Docker containerization
- Environment-based configuration
- Database migrations
- Health check endpoints
- Monitoring and logging
- Automated backups

---

## Database Schema

### Tables

#### trends
Stores all aggregated content from various sources.

```sql
CREATE TABLE trends (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  normalized_url TEXT NOT NULL, -- URL without tracking params
  content TEXT, -- Full text content (for articles)
  thumbnail_url TEXT,

  -- Classification
  source_type VARCHAR(20) NOT NULL, -- 'rss', 'youtube', 'reddit', 'hackernews', 'arxiv'
  source_id INTEGER REFERENCES sources(id),
  source_name VARCHAR(100) NOT NULL, -- Display name (e.g., "TechCrunch")
  category VARCHAR(50), -- AI-generated category
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10),

  -- AI Processing
  summary TEXT, -- Claude-generated 3-4 sentence summary
  key_insights JSONB, -- Array of insight strings
  ai_processed BOOLEAN DEFAULT false,
  ai_processed_at TIMESTAMP,
  ai_processing_error TEXT,

  -- Metadata
  metadata JSONB, -- Video duration, author, views, etc.

  -- Timestamps
  published_at TIMESTAMP NOT NULL,
  fetched_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

  -- User Interactions (single user for MVP)
  is_read BOOLEAN DEFAULT false,
  is_bookmarked BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  bookmarked_at TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_source_type CHECK (source_type IN ('rss', 'youtube', 'reddit', 'hackernews', 'arxiv'))
);

-- Indexes for performance
CREATE INDEX idx_trends_published_at ON trends(published_at DESC);
CREATE INDEX idx_trends_source_type ON trends(source_type);
CREATE INDEX idx_trends_category ON trends(category);
CREATE INDEX idx_trends_is_read ON trends(is_read);
CREATE INDEX idx_trends_is_bookmarked ON trends(is_bookmarked) WHERE is_bookmarked = true;
CREATE INDEX idx_trends_ai_processed ON trends(ai_processed) WHERE ai_processed = false;
CREATE INDEX idx_trends_normalized_url ON trends(normalized_url);
CREATE INDEX idx_trends_search ON trends USING gin(to_tsvector('english', title || ' ' || COALESCE(summary, '')));
```

#### sources
Configuration for each content source.

```sql
CREATE TABLE sources (
  -- Identity
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL, -- "TechCrunch AI"

  -- Configuration
  type VARCHAR(20) NOT NULL, -- 'rss', 'youtube', 'reddit', 'hackernews', 'arxiv'
  url TEXT NOT NULL, -- Feed URL, channel ID, subreddit, etc.
  config JSONB, -- Type-specific config (API keys, filters, etc.)

  -- State
  is_active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMP,
  last_success_at TIMESTAMP,
  last_error TEXT,
  consecutive_failures INTEGER DEFAULT 0,

  -- Stats
  total_items_fetched INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_source_type CHECK (type IN ('rss', 'youtube', 'reddit', 'hackernews', 'arxiv'))
);

CREATE INDEX idx_sources_active ON sources(is_active) WHERE is_active = true;
CREATE INDEX idx_sources_type ON sources(type);
```

#### scraper_jobs
Track scraper execution history.

```sql
CREATE TABLE scraper_jobs (
  id SERIAL PRIMARY KEY,

  -- Job details
  job_type VARCHAR(20) NOT NULL, -- 'scheduled', 'manual'
  source_id INTEGER REFERENCES sources(id),

  -- Status
  status VARCHAR(20) NOT NULL, -- 'pending', 'running', 'success', 'failed'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Results
  items_fetched INTEGER DEFAULT 0,
  items_new INTEGER DEFAULT 0,
  items_duplicate INTEGER DEFAULT 0,
  error_message TEXT,

  -- Metadata
  metadata JSONB, -- API rate limits, processing time, etc.

  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_scraper_jobs_status ON scraper_jobs(status);
CREATE INDEX idx_scraper_jobs_created_at ON scraper_jobs(created_at DESC);
```

#### ai_processing_queue
Queue for AI processing to manage costs and rate limits.

```sql
CREATE TABLE ai_processing_queue (
  id SERIAL PRIMARY KEY,
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,

  -- Priority
  priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  processing_started_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Error tracking
  last_error TEXT,

  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE INDEX idx_ai_queue_status_priority ON ai_processing_queue(status, priority) WHERE status = 'pending';
CREATE INDEX idx_ai_queue_trend_id ON ai_processing_queue(trend_id);
```

#### user_preferences
Store user configuration (single user for MVP, extensible for multi-user).

```sql
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,

  -- Source preferences
  enabled_sources INTEGER[], -- Array of source IDs
  enabled_categories VARCHAR(50)[],

  -- Display preferences
  items_per_page INTEGER DEFAULT 20,
  default_sort VARCHAR(20) DEFAULT 'date', -- 'date', 'relevance'
  theme VARCHAR(10) DEFAULT 'light', -- 'light', 'dark', 'system'

  -- Refresh settings
  refresh_frequency INTEGER DEFAULT 360, -- minutes (6 hours)

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- For MVP, ensure only one preferences row exists
INSERT INTO user_preferences (id) VALUES (1) ON CONFLICT DO NOTHING;
```

### Data Retention Policy

```sql
-- Auto-delete old trends (runs daily)
-- Keep: bookmarked items indefinitely, others for 90 days
DELETE FROM trends
WHERE
  is_bookmarked = false
  AND published_at < NOW() - INTERVAL '90 days';

-- Auto-delete old scraper jobs (keep 30 days)
DELETE FROM scraper_jobs
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## Detailed Implementation Guide

### Prerequisites

**Required:**
- Node.js 18+ installed
- PostgreSQL 15+ (production) or SQLite (development)
- Anthropic API key
- YouTube Data API v3 key

**Optional:**
- Reddit API credentials
- Docker Desktop (for containerized development)

---

## Phase 1: Backend Implementation (Days 1-2)

### Step 1.1: Project Initialization (30 min)

**Backend Setup:**
```bash
# Navigate to backend directory
cd apps/backend

# Initialize package.json if not exists
npm init -y

# Install production dependencies
npm install express cors dotenv
npm install @anthropic-ai/sdk rss-parser axios cheerio
npm install drizzle-orm postgres
npm install node-cron zod winston
npm install date-fns

# Install development dependencies
npm install -D typescript tsx @types/node @types/express @types/cors
npm install -D drizzle-kit vitest
npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D @types/node-cron

# Create TypeScript config
npx tsc --init
```

**Frontend Setup:**
```bash
# Navigate to frontend directory
cd apps/frontend

# Create Vite + React + TypeScript app
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install @tanstack/react-query axios zustand
npm install react-router-dom date-fns
npm install lucide-react

# Install TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Environment Files:**

Create `apps/backend/.env.example`:
```env
# Server
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_trends
# For development with SQLite:
# DATABASE_URL=file:./dev.db

# APIs
ANTHROPIC_API_KEY=your_anthropic_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here

# Optional APIs
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=

# Scraper Settings
SCRAPER_CRON_SCHEDULE=0 */6 * * *
MAX_ITEMS_PER_SOURCE=50

# AI Processing
AI_BATCH_SIZE=10
AI_MAX_TOKENS=500
AI_MODEL=claude-3-5-sonnet-20241022

# Logging
LOG_LEVEL=info
```

Copy to `.env` and fill in actual values:
```bash
cp .env.example .env
```

### Step 1.2: Database Setup (45 min)

**Install Drizzle ORM:**
```bash
cd apps/backend
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

**Create Drizzle config** (`drizzle.config.ts`):
```typescript
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Create schema** (`apps/backend/src/db/schema.ts`):
```typescript
import { pgTable, uuid, text, varchar, timestamp, boolean, integer, serial, jsonb, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const trends = pgTable('trends', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull().unique(),
  normalizedUrl: text('normalized_url').notNull(),
  content: text('content'),
  thumbnailUrl: text('thumbnail_url'),

  sourceType: varchar('source_type', { length: 20 }).notNull(),
  sourceId: integer('source_id').references(() => sources.id),
  sourceName: varchar('source_name', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }),
  relevanceScore: integer('relevance_score'),

  summary: text('summary'),
  keyInsights: jsonb('key_insights').$type<string[]>(),
  aiProcessed: boolean('ai_processed').default(false),
  aiProcessedAt: timestamp('ai_processed_at'),
  aiProcessingError: text('ai_processing_error'),

  metadata: jsonb('metadata'),

  publishedAt: timestamp('published_at').notNull(),
  fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  isRead: boolean('is_read').default(false),
  isBookmarked: boolean('is_bookmarked').default(false),
  readAt: timestamp('read_at'),
  bookmarkedAt: timestamp('bookmarked_at'),
}, (table) => ({
  publishedAtIdx: index('idx_trends_published_at').on(table.publishedAt),
  sourceTypeIdx: index('idx_trends_source_type').on(table.sourceType),
  categoryIdx: index('idx_trends_category').on(table.category),
  isReadIdx: index('idx_trends_is_read').on(table.isRead),
  normalizedUrlIdx: index('idx_trends_normalized_url').on(table.normalizedUrl),
}));

export const sources = pgTable('sources', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull(),
  url: text('url').notNull(),
  config: jsonb('config'),

  isActive: boolean('is_active').default(true),
  lastFetchedAt: timestamp('last_fetched_at'),
  lastSuccessAt: timestamp('last_success_at'),
  lastError: text('last_error'),
  consecutiveFailures: integer('consecutive_failures').default(0),
  totalItemsFetched: integer('total_items_fetched').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  activeIdx: index('idx_sources_active').on(table.isActive),
  typeIdx: index('idx_sources_type').on(table.type),
}));

// Additional tables: scraper_jobs, ai_processing_queue, user_preferences
// (Implement similarly following the schema above)
```

**Generate and run migrations:**
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

**Seed initial sources:**
Create `apps/backend/src/db/seed.ts`:
```typescript
import { db } from './index';
import { sources } from './schema';

async function seed() {
  await db.insert(sources).values([
    // RSS Feeds
    { name: 'TechCrunch AI', type: 'rss', url: 'https://techcrunch.com/tag/artificial-intelligence/feed/' },
    { name: 'VentureBeat AI', type: 'rss', url: 'https://venturebeat.com/category/ai/feed/' },
    { name: 'The Verge AI', type: 'rss', url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml' },
    { name: 'MIT Tech Review', type: 'rss', url: 'https://www.technologyreview.com/feed/' },
    { name: 'Ars Technica AI', type: 'rss', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },

    // YouTube Channels
    { name: 'Two Minute Papers', type: 'youtube', url: 'UCbfYPyITQ-7l4upoX8nvctg' },
    { name: 'Andrej Karpathy', type: 'youtube', url: 'UCYO_jab_esuFRV4b17AJtAw' },
    { name: 'Yannic Kilcher', type: 'youtube', url: 'UCZHmQk67mSJgfCCTn7xBfew' },

    // Discussion Platforms
    { name: 'r/MachineLearning', type: 'reddit', url: 'MachineLearning', config: { minScore: 100 } },
    { name: 'Hacker News AI', type: 'hackernews', url: 'https://news.ycombinator.com/', config: { keywords: ['AI', 'ML', 'LLM'] } },
  ]);

  console.log('✅ Database seeded successfully');
}

seed().catch(console.error);
```

Run seed:
```bash
tsx src/db/seed.ts
```

### Step 1.3: Build Scraper Infrastructure (3 hours)

**Create base scraper interface** (`apps/backend/src/scrapers/base.scraper.ts`):

```typescript
export interface ScraperResult {
  title: string;
  url: string;
  normalizedUrl: string;
  content?: string;
  thumbnailUrl?: string;
  publishedAt: Date;
  metadata?: Record<string, any>;
}

export interface Scraper {
  name: string;
  type: 'rss' | 'youtube' | 'reddit' | 'hackernews' | 'arxiv';

  /**
   * Check if scraper can run (e.g., API keys present)
   */
  canScrape(): boolean;

  /**
   * Fetch items from the source
   * @param maxItems Maximum items to fetch
   */
  scrape(maxItems?: number): Promise<ScraperResult[]>;

  /**
   * Normalize URL (remove tracking params)
   */
  normalizeUrl(url: string): string;
}

export abstract class BaseScraper implements Scraper {
  abstract name: string;
  abstract type: 'rss' | 'youtube' | 'reddit' | 'hackernews' | 'arxiv';

  abstract canScrape(): boolean;
  abstract scrape(maxItems?: number): Promise<ScraperResult[]>;

  normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove common tracking parameters
      ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source'].forEach(param => {
        parsed.searchParams.delete(param);
      });
      return parsed.toString();
    } catch {
      return url;
    }
  }

  protected handleError(error: any, context: string): never {
    throw new Error(`[${this.name}] ${context}: ${error.message}`);
  }
}
```

**RSS Scraper** (`apps/backend/src/scrapers/rss.scraper.ts`):
```typescript
import Parser from 'rss-parser';
import { BaseScraper, ScraperResult } from './base.scraper';
import { logger } from '../utils/logger';

export class RSScraper extends BaseScraper {
  name: string;
  type = 'rss' as const;
  private feedUrl: string;
  private parser: Parser;

  constructor(name: string, feedUrl: string) {
    super();
    this.name = name;
    this.feedUrl = feedUrl;
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'AI-Trends-Tracker/1.0',
      },
    });
  }

  canScrape(): boolean {
    return !!this.feedUrl;
  }

  async scrape(maxItems = 50): Promise<ScraperResult[]> {
    try {
      logger.info(`[${this.name}] Fetching RSS feed from ${this.feedUrl}`);

      const feed = await this.parser.parseURL(this.feedUrl);
      const items = feed.items.slice(0, maxItems);

      return items.map(item => ({
        title: item.title || 'Untitled',
        url: item.link || '',
        normalizedUrl: this.normalizeUrl(item.link || ''),
        content: item.contentSnippet || item.content || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        metadata: {
          author: item.creator || item.author,
          categories: item.categories || [],
        },
      }));
    } catch (error) {
      this.handleError(error, 'Failed to scrape RSS feed');
    }
  }
}
```

**YouTube Scraper** (`apps/backend/src/scrapers/youtube.scraper.ts`):
```typescript
import axios from 'axios';
import { BaseScraper, ScraperResult } from './base.scraper';
import { logger } from '../utils/logger';

export class YouTubeScraper extends BaseScraper {
  name: string;
  type = 'youtube' as const;
  private channelId: string;
  private apiKey: string;

  constructor(name: string, channelId: string) {
    super();
    this.name = name;
    this.channelId = channelId;
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
  }

  canScrape(): boolean {
    return !!this.apiKey && !!this.channelId;
  }

  async scrape(maxItems = 10): Promise<ScraperResult[]> {
    if (!this.canScrape()) {
      throw new Error('YouTube API key not configured');
    }

    try {
      logger.info(`[${this.name}] Fetching videos from channel ${this.channelId}`);

      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            part: 'snippet',
            channelId: this.channelId,
            order: 'date',
            maxResults: maxItems,
            type: 'video',
            key: this.apiKey,
          },
          timeout: 10000,
        }
      );

      return response.data.items.map((item: any) => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        normalizedUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        publishedAt: new Date(item.snippet.publishedAt),
        metadata: {
          videoId: item.id.videoId,
          channelTitle: item.snippet.channelTitle,
          description: item.snippet.description,
        },
      }));
    } catch (error: any) {
      if (error.response?.status === 403) {
        logger.error(`[${this.name}] YouTube API quota exceeded or invalid key`);
      }
      this.handleError(error, 'Failed to scrape YouTube');
    }
  }
}
```

**Hacker News Scraper** (`apps/backend/src/scrapers/hackernews.scraper.ts`):
```typescript
import axios from 'axios';
import { BaseScraper, ScraperResult } from './base.scraper';
import { logger } from '../utils/logger';

export class HackerNewsScraper extends BaseScraper {
  name = 'Hacker News AI';
  type = 'hackernews' as const;
  private keywords: string[];

  constructor(keywords: string[] = ['AI', 'ML', 'LLM', 'GPT', 'Claude', 'OpenAI']) {
    super();
    this.keywords = keywords;
  }

  canScrape(): boolean {
    return true; // No API key needed
  }

  async scrape(maxItems = 30): Promise<ScraperResult[]> {
    try {
      logger.info('[Hacker News] Fetching top stories');

      // Get top story IDs
      const topStoriesRes = await axios.get(
        'https://hacker-news.firebaseio.com/v0/topstories.json',
        { timeout: 10000 }
      );

      const storyIds = topStoriesRes.data.slice(0, 100); // Check top 100
      const results: ScraperResult[] = [];

      // Fetch stories in parallel (batch of 10)
      for (let i = 0; i < storyIds.length && results.length < maxItems; i += 10) {
        const batch = storyIds.slice(i, i + 10);
        const stories = await Promise.all(
          batch.map(id =>
            axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
              .then(res => res.data)
              .catch(() => null)
          )
        );

        // Filter for AI-related stories
        for (const story of stories) {
          if (!story || story.type !== 'story') continue;

          const titleAndText = `${story.title} ${story.text || ''}`.toLowerCase();
          const isAIRelated = this.keywords.some(keyword =>
            titleAndText.includes(keyword.toLowerCase())
          );

          if (isAIRelated && story.url) {
            results.push({
              title: story.title,
              url: story.url,
              normalizedUrl: this.normalizeUrl(story.url),
              publishedAt: new Date(story.time * 1000),
              metadata: {
                hnUrl: `https://news.ycombinator.com/item?id=${story.id}`,
                score: story.score,
                comments: story.descendants || 0,
                by: story.by,
              },
            });

            if (results.length >= maxItems) break;
          }
        }
      }

      logger.info(`[Hacker News] Found ${results.length} AI-related stories`);
      return results;
    } catch (error) {
      this.handleError(error, 'Failed to scrape Hacker News');
    }
  }
}
```

**Reddit Scraper** (`apps/backend/src/scrapers/reddit.scraper.ts`):
```typescript
import axios from 'axios';
import { BaseScraper, ScraperResult } from './base.scraper';
import { logger } from '../utils/logger';

export class RedditScraper extends BaseScraper {
  name: string;
  type = 'reddit' as const;
  private subreddit: string;
  private minScore: number;

  constructor(subreddit: string, minScore = 100) {
    super();
    this.name = `r/${subreddit}`;
    this.subreddit = subreddit;
    this.minScore = minScore;
  }

  canScrape(): boolean {
    return !!this.subreddit;
  }

  async scrape(maxItems = 25): Promise<ScraperResult[]> {
    try {
      logger.info(`[${this.name}] Fetching top posts from r/${this.subreddit}`);

      const response = await axios.get(
        `https://www.reddit.com/r/${this.subreddit}/top.json`,
        {
          params: {
            limit: maxItems * 2, // Fetch more to filter by score
            t: 'week', // Top posts from last week
          },
          headers: {
            'User-Agent': 'AI-Trends-Tracker/1.0',
          },
          timeout: 10000,
        }
      );

      const posts = response.data.data.children
        .map((child: any) => child.data)
        .filter((post: any) => post.score >= this.minScore && !post.is_self)
        .slice(0, maxItems);

      return posts.map((post: any) => ({
        title: post.title,
        url: post.url,
        normalizedUrl: this.normalizeUrl(post.url),
        publishedAt: new Date(post.created_utc * 1000),
        metadata: {
          redditUrl: `https://reddit.com${post.permalink}`,
          score: post.score,
          comments: post.num_comments,
          author: post.author,
          subreddit: post.subreddit,
        },
      }));
    } catch (error) {
      this.handleError(error, 'Failed to scrape Reddit');
    }
  }
}
```

**Scraper Factory** (`apps/backend/src/scrapers/factory.ts`):
```typescript
import { Scraper } from './base.scraper';
import { RSScraper } from './rss.scraper';
import { YouTubeScraper } from './youtube.scraper';
import { HackerNewsScraper } from './hackernews.scraper';
import { RedditScraper } from './reddit.scraper';
import { logger } from '../utils/logger';

export class ScraperFactory {
  static createFromSource(source: {
    id: number;
    name: string;
    type: string;
    url: string;
    config?: any;
  }): Scraper | null {
    try {
      switch (source.type) {
        case 'rss':
          return new RSScraper(source.name, source.url);

        case 'youtube':
          return new YouTubeScraper(source.name, source.url);

        case 'hackernews':
          return new HackerNewsScraper(source.config?.keywords || []);

        case 'reddit':
          return new RedditScraper(source.url, source.config?.minScore || 100);

        default:
          logger.warn(`Unknown scraper type: ${source.type}`);
          return null;
      }
    } catch (error) {
      logger.error(`Failed to create scraper for ${source.name}:`, error);
      return null;
    }
  }
}
```

### Step 1.4: Content Deduplication Service (1 hour)

**Deduplication Logic** (`apps/backend/src/services/deduplication.service.ts`):
```typescript
import { db } from '../db';
import { trends } from '../db/schema';
import { eq } from 'drizzle-orm';
import { ScraperResult } from '../scrapers/base.scraper';

/**
 * Calculate similarity between two strings (Levenshtein distance)
 */
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

export class DeduplicationService {
  /**
   * Check if a trend already exists (by URL or title similarity)
   */
  async isDuplicate(result: ScraperResult): Promise<boolean> {
    // Check exact URL match
    const existingByUrl = await db
      .select()
      .from(trends)
      .where(eq(trends.normalizedUrl, result.normalizedUrl))
      .limit(1);

    if (existingByUrl.length > 0) {
      return true;
    }

    // Check title similarity (>85% match within last 7 days)
    const recentTrends = await db
      .select()
      .from(trends)
      .where(
        sql`published_at > NOW() - INTERVAL '7 days'`
      )
      .limit(500); // Check last 500 trends for performance

    for (const trend of recentTrends) {
      const titleSimilarity = similarity(
        result.title.toLowerCase(),
        trend.title.toLowerCase()
      );

      if (titleSimilarity > 0.85) {
        return true;
      }
    }

    return false;
  }

  /**
   * Filter out duplicates from a batch of results
   */
  async filterDuplicates(results: ScraperResult[]): Promise<ScraperResult[]> {
    const unique: ScraperResult[] = [];

    for (const result of results) {
      const isDupe = await this.isDuplicate(result);
      if (!isDupe) {
        unique.push(result);
      }
    }

    return unique;
  }
}
```

### Step 1.5: AI Processing Service (2 hours)

**AI Service** (`apps/backend/src/services/ai.service.ts`):
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import { z } from 'zod';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const AIResponseSchema = z.object({
  summary: z.string(),
  category: z.enum(['Research', 'Product', 'Tutorial', 'News', 'Opinion', 'Breakthrough']),
  insights: z.array(z.string()).min(3).max(5),
  relevanceScore: z.number().min(1).max(10),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

export class AIService {
  private model: string;
  private maxTokens: number;

  constructor() {
    this.model = process.env.AI_MODEL || 'claude-3-5-sonnet-20241022';
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS || '500');
  }

  async processContent(title: string, content: string): Promise<AIResponse> {
    try {
      logger.info(`Processing content with AI: "${title.substring(0, 50)}..."`);

      const message = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          {
            role: 'user',
            content: `Analyze this AI-related article and provide the following:

1. **Summary**: A concise 3-4 sentence summary of the main points
2. **Category**: Classify into ONE of these categories:
   - Research: Academic papers, research findings
   - Product: New products, features, or releases
   - Tutorial: Educational content, how-tos
   - News: Industry news, announcements, partnerships
   - Opinion: Editorials, think pieces
   - Breakthrough: Major advancements or discoveries

3. **Key Insights**: 3-5 bullet points of the most important takeaways
4. **Relevance Score**: Rate from 1-10 how relevant this is to AI practitioners (10 = must-read)

Title: ${title}
Content: ${content.substring(0, 2000)} ${content.length > 2000 ? '...' : ''}

Respond ONLY with valid JSON in this exact format:
{
  "summary": "...",
  "category": "Research|Product|Tutorial|News|Opinion|Breakthrough",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "relevanceScore": 8
}`,
          },
        ],
      });

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const validated = AIResponseSchema.parse(parsed);

      logger.info(`AI processing complete: category=${validated.category}, score=${validated.relevanceScore}`);
      return validated;

    } catch (error: any) {
      logger.error('AI processing failed:', error);

      // Return fallback response
      return {
        summary: `${title}. ${content.substring(0, 200)}...`,
        category: 'News',
        insights: ['Unable to process with AI', 'Fallback summary provided'],
        relevanceScore: 5,
      };
    }
  }

  /**
   * Process multiple items in batch (with delay to respect rate limits)
   */
  async processBatch(
    items: Array<{ title: string; content: string }>,
    delayMs = 1000
  ): Promise<AIResponse[]> {
    const results: AIResponse[] = [];

    for (const item of items) {
      const result = await this.processContent(item.title, item.content);
      results.push(result);

      // Delay between requests to avoid rate limits
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }
}
```

### Step 1.6: Trends Service (1.5 hours)

**Main Service** (`apps/backend/src/services/trends.service.ts`):
```typescript
import { db } from '../db';
import { trends, sources } from '../db/schema';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import { ScraperFactory } from '../scrapers/factory';
import { DeduplicationService } from './deduplication.service';
import { AIService } from './ai.service';
import { logger } from '../utils/logger';

export class TrendsService {
  private deduplicationService: DeduplicationService;
  private aiService: AIService;

  constructor() {
    this.deduplicationService = new DeduplicationService();
    this.aiService = new AIService();
  }

  /**
   * Fetch trends with filters and pagination
   */
  async getTrends(filters: {
    sourceType?: string;
    category?: string;
    search?: string;
    isRead?: boolean;
    isBookmarked?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters.sourceType) {
      conditions.push(eq(trends.sourceType, filters.sourceType));
    }

    if (filters.category) {
      conditions.push(eq(trends.category, filters.category));
    }

    if (filters.isRead !== undefined) {
      conditions.push(eq(trends.isRead, filters.isRead));
    }

    if (filters.isBookmarked !== undefined) {
      conditions.push(eq(trends.isBookmarked, filters.isBookmarked));
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(trends.title, `%${filters.search}%`),
          ilike(trends.summary, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(trends)
        .where(whereClause)
        .orderBy(desc(trends.publishedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(trends)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count || 0;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single trend by ID
   */
  async getTrendById(id: string) {
    const result = await db
      .select()
      .from(trends)
      .where(eq(trends.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Mark trend as read/unread
   */
  async markAsRead(id: string, isRead: boolean) {
    await db
      .update(trends)
      .set({
        isRead,
        readAt: isRead ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(trends.id, id));
  }

  /**
   * Toggle bookmark
   */
  async toggleBookmark(id: string) {
    const trend = await this.getTrendById(id);
    if (!trend) throw new Error('Trend not found');

    const newBookmarkState = !trend.isBookmarked;

    await db
      .update(trends)
      .set({
        isBookmarked: newBookmarkState,
        bookmarkedAt: newBookmarkState ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(trends.id, id));

    return { isBookmarked: newBookmarkState };
  }

  /**
   * Refresh trends from all active sources
   */
  async refreshAllSources() {
    const activeSources = await db
      .select()
      .from(sources)
      .where(eq(sources.isActive, true));

    logger.info(`Starting refresh for ${activeSources.length} sources`);

    const results = {
      totalFetched: 0,
      totalNew: 0,
      totalDuplicates: 0,
      errors: [] as string[],
    };

    for (const source of activeSources) {
      try {
        const scraper = ScraperFactory.createFromSource(source);
        if (!scraper) {
          logger.warn(`No scraper available for ${source.name}`);
          continue;
        }

        if (!scraper.canScrape()) {
          logger.warn(`Scraper not configured for ${source.name}`);
          continue;
        }

        // Scrape content
        const items = await scraper.scrape(
          parseInt(process.env.MAX_ITEMS_PER_SOURCE || '50')
        );
        results.totalFetched += items.length;

        // Filter duplicates
        const uniqueItems = await this.deduplicationService.filterDuplicates(items);
        results.totalNew += uniqueItems.length;
        results.totalDuplicates += items.length - uniqueItems.length;

        // Save to database
        for (const item of uniqueItems) {
          await db.insert(trends).values({
            title: item.title,
            url: item.url,
            normalizedUrl: item.normalizedUrl,
            content: item.content || '',
            thumbnailUrl: item.thumbnailUrl,
            sourceType: source.type,
            sourceId: source.id,
            sourceName: source.name,
            publishedAt: item.publishedAt,
            metadata: item.metadata,
            aiProcessed: false,
          });
        }

        // Update source status
        await db
          .update(sources)
          .set({
            lastFetchedAt: new Date(),
            lastSuccessAt: new Date(),
            consecutiveFailures: 0,
            totalItemsFetched: sql`${sources.totalItemsFetched} + ${items.length}`,
            updatedAt: new Date(),
          })
          .where(eq(sources.id, source.id));

        logger.info(`[${source.name}] Fetched ${items.length}, new ${uniqueItems.length}`);

      } catch (error: any) {
        logger.error(`[${source.name}] Error:`, error);
        results.errors.push(`${source.name}: ${error.message}`);

        // Update source with error
        await db
          .update(sources)
          .set({
            lastFetchedAt: new Date(),
            lastError: error.message,
            consecutiveFailures: sql`${sources.consecutiveFailures} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(sources.id, source.id));
      }
    }

    logger.info('Refresh complete:', results);
    return results;
  }

  /**
   * Get statistics
   */
  async getStats() {
    const [totalCount, unreadCount, bookmarkedCount, categoryStats, sourceStats] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(trends),
      db.select({ count: sql<number>`count(*)` }).from(trends).where(eq(trends.isRead, false)),
      db.select({ count: sql<number>`count(*)` }).from(trends).where(eq(trends.isBookmarked, true)),
      db.select({
        category: trends.category,
        count: sql<number>`count(*)`,
      }).from(trends).groupBy(trends.category),
      db.select({
        sourceType: trends.sourceType,
        count: sql<number>`count(*)`,
      }).from(trends).groupBy(trends.sourceType),
    ]);

    return {
      total: totalCount[0]?.count || 0,
      unread: unreadCount[0]?.count || 0,
      bookmarked: bookmarkedCount[0]?.count || 0,
      byCategory: categoryStats,
      bySource: sourceStats,
    };
  }
}
```

### Step 1.7: API Routes (1.5 hours)

**Trends Routes** (`apps/backend/src/routes/trends.routes.ts`):
```typescript
import { Router } from 'express';
import { TrendsService } from '../services/trends.service';
import { z } from 'zod';

const router = Router();
const trendsService = new TrendsService();

// Validation schemas
const GetTrendsQuerySchema = z.object({
  sourceType: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  isRead: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  isBookmarked: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '20')),
});

// GET /api/trends - List trends with filters
router.get('/', async (req, res, next) => {
  try {
    const filters = GetTrendsQuerySchema.parse(req.query);
    const result = await trendsService.getTrends(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/trends/:id - Get single trend
router.get('/:id', async (req, res, next) => {
  try {
    const trend = await trendsService.getTrendById(req.params.id);
    if (!trend) {
      return res.status(404).json({ error: 'Trend not found' });
    }
    res.json(trend);
  } catch (error) {
    next(error);
  }
});

// POST /api/trends/refresh - Manually trigger refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const result = await trendsService.refreshAllSources();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/trends/:id/read - Mark as read/unread
router.patch('/:id/read', async (req, res, next) => {
  try {
    const { isRead } = req.body;
    await trendsService.markAsRead(req.params.id, isRead);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/trends/:id/bookmark - Toggle bookmark
router.patch('/:id/bookmark', async (req, res, next) => {
  try {
    const result = await trendsService.toggleBookmark(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Sources Routes** (`apps/backend/src/routes/sources.routes.ts`):
```typescript
import { Router } from 'express';
import { db } from '../db';
import { sources } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/sources - List all sources
router.get('/', async (req, res, next) => {
  try {
    const allSources = await db.select().from(sources);
    res.json(allSources);
  } catch (error) {
    next(error);
  }
});

// GET /api/sources/status - Health check for sources
router.get('/status', async (req, res, next) => {
  try {
    const allSources = await db.select().from(sources);
    const status = allSources.map(source => ({
      id: source.id,
      name: source.name,
      type: source.type,
      isActive: source.isActive,
      lastFetchedAt: source.lastFetchedAt,
      lastSuccessAt: source.lastSuccessAt,
      consecutiveFailures: source.consecutiveFailures,
      status: source.consecutiveFailures >= 3 ? 'failing' : 'healthy',
    }));
    res.json(status);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/sources/:id/toggle - Enable/disable source
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const { isActive } = req.body;
    await db
      .update(sources)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(sources.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Stats & Health Routes** (`apps/backend/src/routes/stats.routes.ts`):
```typescript
import { Router } from 'express';
import { TrendsService } from '../services/trends.service';
import { db } from '../db';
import { trends } from '../db/schema';
import { desc, sql } from 'drizzle-orm';

const router = Router();
const trendsService = new TrendsService();

// GET /api/stats - Aggregated statistics
router.get('/', async (req, res, next) => {
  try {
    const stats = await trendsService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/health - Service health check
router.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// GET /api/categories - List all categories with counts
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await db
      .select({
        category: trends.category,
        count: sql<number>`count(*)`,
      })
      .from(trends)
      .groupBy(trends.category)
      .orderBy(desc(sql`count(*)`));

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Main App** (`apps/backend/src/index.ts`):
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import trendsRoutes from './routes/trends.routes';
import sourcesRoutes from './routes/sources.routes';
import statsRoutes from './routes/stats.routes';
import { logger } from './utils/logger';
import { startCronJobs } from './jobs/scraper.job';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/trends', trendsRoutes);
app.use('/api/sources', sourcesRoutes);
app.use('/api/stats', statsRoutes);
app.get('/api/health', statsRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 API available at http://localhost:${PORT}/api`);

  // Start cron jobs
  startCronJobs();
});
```

### Step 1.8: Cron Jobs & AI Processing (1 hour)

**Scraper Cron Job** (`apps/backend/src/jobs/scraper.job.ts`):
```typescript
import cron from 'node-cron';
import { TrendsService } from '../services/trends.service';
import { logger } from '../utils/logger';

const trendsService = new TrendsService();

export function startCronJobs() {
  const schedule = process.env.SCRAPER_CRON_SCHEDULE || '0 */6 * * *';

  logger.info(`📅 Scheduling scraper job: ${schedule}`);

  // Scrape all sources every 6 hours
  cron.schedule(schedule, async () => {
    logger.info('🔄 Starting scheduled scraping job');

    try {
      const result = await trendsService.refreshAllSources();
      logger.info('✅ Scraping job completed', result);
    } catch (error) {
      logger.error('❌ Scraping job failed:', error);
    }
  });

  // Run AI processing every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('🤖 Starting AI processing job');
    // This will be implemented in AI processing queue
  });

  logger.info('✅ Cron jobs started');
}
```

**Logger Utility** (`apps/backend/src/utils/logger.ts`):
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

---

## Phase 2: Frontend Implementation (Days 3-4)

### Step 2.1: Project Setup (30 min)

**TailwindCSS Configuration** (`apps/frontend/tailwind.config.js`):
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
}
```

**TypeScript Config** (`apps/frontend/tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 2.2: API Client & Types (45 min)

**Types** (`apps/frontend/src/types/index.ts`):
```typescript
export interface Trend {
  id: string;
  title: string;
  url: string;
  normalizedUrl: string;
  content: string | null;
  thumbnailUrl: string | null;
  sourceType: 'rss' | 'youtube' | 'reddit' | 'hackernews' | 'arxiv';
  sourceId: number;
  sourceName: string;
  category: string | null;
  relevanceScore: number | null;
  summary: string | null;
  keyInsights: string[] | null;
  aiProcessed: boolean;
  aiProcessedAt: string | null;
  metadata: Record<string, any> | null;
  publishedAt: string;
  fetchedAt: string;
  updatedAt: string;
  isRead: boolean;
  isBookmarked: boolean;
  readAt: string | null;
  bookmarkedAt: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TrendsFilters {
  sourceType?: string;
  category?: string;
  search?: string;
  isRead?: boolean;
  isBookmarked?: boolean;
  page?: number;
  limit?: number;
}

export interface Source {
  id: number;
  name: string;
  type: string;
  url: string;
  isActive: boolean;
  lastFetchedAt: string | null;
  lastSuccessAt: string | null;
  consecutiveFailures: number;
}

export interface Stats {
  total: number;
  unread: number;
  bookmarked: number;
  byCategory: Array<{ category: string; count: number }>;
  bySource: Array<{ sourceType: string; count: number }>;
}
```

**API Client** (`apps/frontend/src/services/api.ts`):
```typescript
import axios from 'axios';
import { Trend, PaginatedResponse, TrendsFilters, Source, Stats } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 30000,
});

export const trendsAPI = {
  // Get trends with filters
  getTrends: async (filters: TrendsFilters): Promise<PaginatedResponse<Trend>> => {
    const response = await api.get('/trends', { params: filters });
    return response.data;
  },

  // Get single trend
  getTrend: async (id: string): Promise<Trend> => {
    const response = await api.get(`/trends/${id}`);
    return response.data;
  },

  // Refresh all sources
  refreshTrends: async () => {
    const response = await api.post('/trends/refresh');
    return response.data;
  },

  // Mark as read
  markAsRead: async (id: string, isRead: boolean) => {
    await api.patch(`/trends/${id}/read`, { isRead });
  },

  // Toggle bookmark
  toggleBookmark: async (id: string) => {
    const response = await api.patch(`/trends/${id}/bookmark`);
    return response.data;
  },
};

export const sourcesAPI = {
  // Get all sources
  getSources: async (): Promise<Source[]> => {
    const response = await api.get('/sources');
    return response.data;
  },

  // Get sources status
  getSourcesStatus: async () => {
    const response = await api.get('/sources/status');
    return response.data;
  },

  // Toggle source
  toggleSource: async (id: number, isActive: boolean) => {
    await api.patch(`/sources/${id}/toggle`, { isActive });
  },
};

export const statsAPI = {
  // Get statistics
  getStats: async (): Promise<Stats> => {
    const response = await api.get('/stats');
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};
```

### Step 2.3: State Management (30 min)

**Zustand Store** (`apps/frontend/src/store/useStore.ts`):
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TrendsFilters } from '../types';

interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Filters
  filters: TrendsFilters;
  setFilters: (filters: Partial<TrendsFilters>) => void;
  resetFilters: () => void;

  // Selected trend for modal
  selectedTrendId: string | null;
  setSelectedTrendId: (id: string | null) => void;
}

const defaultFilters: TrendsFilters = {
  page: 1,
  limit: 20,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Filters
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters, page: 1 },
        })),
      resetFilters: () => set({ filters: defaultFilters }),

      // Selected trend
      selectedTrendId: null,
      setSelectedTrendId: (id) => set({ selectedTrendId: id }),
    }),
    {
      name: 'ai-trends-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
```

### Step 2.4: Custom Hooks (45 min)

**Trends Hook** (`apps/frontend/src/hooks/useTrends.ts`):
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trendsAPI } from '../services/api';
import { TrendsFilters } from '../types';

export function useTrends(filters: TrendsFilters) {
  return useQuery({
    queryKey: ['trends', filters],
    queryFn: () => trendsAPI.getTrends(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrend(id: string | null) {
  return useQuery({
    queryKey: ['trend', id],
    queryFn: () => trendsAPI.getTrend(id!),
    enabled: !!id,
  });
}

export function useRefreshTrends() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trendsAPI.refreshTrends,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trends'] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      trendsAPI.markAsRead(id, isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trends'] });
    },
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trendsAPI.toggleBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trends'] });
    },
  });
}
```

### Step 2.5: Core Components (3-4 hours)

**Trend Card Component** (`apps/frontend/src/components/TrendCard.tsx`):

```typescript
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, ExternalLink, Eye } from 'lucide-react';
import { Trend } from '../types';
import { useMarkAsRead, useToggleBookmark } from '../hooks/useTrends';

interface TrendCardProps {
  trend: Trend;
  onClick: () => void;
}

export function TrendCard({ trend, onClick }: TrendCardProps) {
  const markAsReadMutation = useMarkAsRead();
  const toggleBookmarkMutation = useToggleBookmark();

  const sourceTypeColors = {
    rss: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    youtube: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    reddit: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    hackernews: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    arxiv: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmarkMutation.mutate(trend.id);
  };

  const handleCardClick = () => {
    if (!trend.isRead) {
      markAsReadMutation.mutate({ id: trend.id, isRead: true });
    }
    onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg
        transition-all duration-200 cursor-pointer overflow-hidden
        ${!trend.isRead ? 'border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'}
      `}
    >
      {trend.thumbnailUrl && (
        <img
          src={trend.thumbnailUrl}
          alt={trend.title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-4">
        {/* Header with badges */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              sourceTypeColors[trend.sourceType]
            }`}
          >
            {trend.sourceName}
          </span>
          {trend.category && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {trend.category}
            </span>
          )}
          {trend.relevanceScore && trend.relevanceScore >= 8 && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              ⭐ High Value
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {trend.title}
        </h3>

        {/* Summary */}
        {trend.summary && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
            {trend.summary}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatDistanceToNow(new Date(trend.publishedAt), { addSuffix: true })}</span>

          <div className="flex items-center gap-2">
            {!trend.isRead && (
              <Eye className="w-4 h-4 text-primary-500" />
            )}
            <button
              onClick={handleBookmark}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                trend.isBookmarked ? 'text-yellow-500' : ''
              }`}
            >
              <Bookmark
                className="w-4 h-4"
                fill={trend.isBookmarked ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Trend Modal Component** (`apps/frontend/src/components/TrendModal.tsx`):
```typescript
import { X, ExternalLink, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Trend } from '../types';
import { useToggleBookmark } from '../hooks/useTrends';

interface TrendModalProps {
  trend: Trend | null;
  onClose: () => void;
}

export function TrendModal({ trend, onClose }: TrendModalProps) {
  const toggleBookmarkMutation = useToggleBookmark();

  if (!trend) return null;

  const handleBookmark = () => {
    toggleBookmarkMutation.mutate(trend.id);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex-1 pr-4">
            {trend.title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                trend.isBookmarked ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Bookmark
                className="w-5 h-5"
                fill={trend.isBookmarked ? 'currentColor' : 'none'}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Metadata */}
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
              {trend.sourceName}
            </span>
            {trend.category && (
              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                {trend.category}
              </span>
            )}
            <span>{formatDistanceToNow(new Date(trend.publishedAt), { addSuffix: true })}</span>
          </div>

          {/* Thumbnail */}
          {trend.thumbnailUrl && (
            <img
              src={trend.thumbnailUrl}
              alt={trend.title}
              className="w-full rounded-lg mb-6"
            />
          )}

          {/* Summary */}
          {trend.summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Summary
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {trend.summary}
              </p>
            </div>
          )}

          {/* Key Insights */}
          {trend.keyInsights && trend.keyInsights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Key Insights
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {trend.keyInsights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Original Link */}
          <a
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Read Original Article
          </a>
        </div>
      </div>
    </div>
  );
}
```

**Filter Bar Component** (`apps/frontend/src/components/FilterBar.tsx`):
```typescript
import { Search, X } from 'lucide-react';
import { TrendsFilters } from '../types';

interface FilterBarProps {
  filters: TrendsFilters;
  onFiltersChange: (filters: Partial<TrendsFilters>) => void;
  onReset: () => void;
}

export function FilterBar({ filters, onFiltersChange, onReset }: FilterBarProps) {
  const categories = ['Research', 'Product', 'Tutorial', 'News', 'Opinion', 'Breakthrough'];
  const sources = ['rss', 'youtube', 'reddit', 'hackernews', 'arxiv'];

  const activeFiltersCount = [
    filters.sourceType,
    filters.category,
    filters.search,
    filters.isRead !== undefined,
    filters.isBookmarked,
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search trends..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Source Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Source
          </label>
          <select
            value={filters.sourceType || ''}
            onChange={(e) => onFiltersChange({ sourceType: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFiltersChange({ category: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={
              filters.isBookmarked
                ? 'bookmarked'
                : filters.isRead === false
                ? 'unread'
                : ''
            }
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'bookmarked') {
                onFiltersChange({ isBookmarked: true, isRead: undefined });
              } else if (value === 'unread') {
                onFiltersChange({ isRead: false, isBookmarked: undefined });
              } else {
                onFiltersChange({ isRead: undefined, isBookmarked: undefined });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All</option>
            <option value="unread">Unread Only</option>
            <option value="bookmarked">Bookmarked</option>
          </select>
        </div>
      </div>

      {/* Reset Button */}
      {activeFiltersCount > 0 && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
          Clear {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
```

**Feed Page** (`apps/frontend/src/pages/Feed.tsx`):
```typescript
import { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { TrendCard } from '../components/TrendCard';
import { TrendModal } from '../components/TrendModal';
import { FilterBar } from '../components/FilterBar';
import { useTrends, useTrend, useRefreshTrends } from '../hooks/useTrends';
import { useStore } from '../store/useStore';

export function Feed() {
  const { filters, setFilters, resetFilters, selectedTrendId, setSelectedTrendId } = useStore();
  const { data, isLoading, error } = useTrends(filters);
  const { data: selectedTrend } = useTrend(selectedTrendId);
  const refreshMutation = useRefreshTrends();

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading trends. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Trends
          </h1>
          {data && (
            <p className="text-gray-600 dark:text-gray-400">
              {data.pagination.total} trends found
            </p>
          )}
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {refreshMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          Refresh
        </button>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      )}

      {/* Grid */}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data.items.map((trend) => (
              <TrendCard
                key={trend.id}
                trend={trend}
                onClick={() => setSelectedTrendId(trend.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(data.pagination.page - 1)}
                disabled={data.pagination.page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(data.pagination.page + 1)}
                disabled={data.pagination.page === data.pagination.totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <TrendModal
        trend={selectedTrend || null}
        onClose={() => setSelectedTrendId(null)}
      />
    </div>
  );
}
```

### Step 2.6: Main App & Routing (30 min)

**App Component** (`apps/frontend/src/App.tsx`):
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Feed } from './pages/Feed';
import { Bookmarks } from './pages/Bookmarks';
import { Settings } from './pages/Settings';
import { Header } from './components/Header';
import { useStore } from './store/useStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

**Header Component** (`apps/frontend/src/components/Header.tsx`):
```typescript
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Bookmark, Settings, Moon, Sun } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '../services/api';

export function Header() {
  const location = useLocation();
  const { theme, setTheme } = useStore();
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: statsAPI.getStats,
    refetchInterval: 60000, // Refetch every minute
  });

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { path: '/', label: 'Feed', icon: TrendingUp },
    { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark, badge: stats?.bookmarked },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              AI Trends Tracker
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {navItems.map(({ path, label, icon: Icon, badge }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 relative ${
                  location.pathname === path
                    ? 'text-primary-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline">{label}</span>
                {badge && badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Unread Badge */}
            {stats && stats.unread > 0 && (
              <div className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                {stats.unread} new
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
```

**Environment Variables** (`apps/frontend/.env.example`):
```env
VITE_API_URL=http://localhost:4000/api
```

---

## Phase 3: Polish & Deployment (Day 5)

### Step 3.1: Docker Configuration (45 min)

**Root docker-compose.yml**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ai_trends
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ai_trends
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      YOUTUBE_API_KEY: ${YOUTUBE_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./apps/backend:/app
      - /app/node_modules
    command: npm run dev

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:4000/api
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
```

**Backend Dockerfile** (`apps/backend/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start command (overridden in docker-compose for dev)
CMD ["npm", "start"]
```

**Frontend Dockerfile** (`apps/frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start command
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### Step 3.2: Testing Setup (1 hour)

**Backend Tests** (`apps/backend/src/services/__tests__/deduplication.test.ts`):
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { DeduplicationService } from '../deduplication.service';

describe('DeduplicationService', () => {
  let service: DeduplicationService;

  beforeEach(() => {
    service = new DeduplicationService();
  });

  it('should detect duplicate URLs', async () => {
    const result = {
      title: 'Test Article',
      url: 'https://example.com/article?utm_source=twitter',
      normalizedUrl: 'https://example.com/article',
      publishedAt: new Date(),
    };

    // Test implementation
  });

  it('should detect similar titles (>85% match)', () => {
    // Test implementation
  });
});
```

**Run tests**:
```bash
cd apps/backend
npm test
```

### Step 3.3: Production Build & Deployment (1.5 hours)

**Build Scripts** (add to `package.json`):

Backend:
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "tsx src/db/seed.ts",
    "test": "vitest"
  }
}
```

Frontend:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

**Deployment Options:**

1. **Railway** (Recommended for MVP):
   - Connect GitHub repo
   - Add PostgreSQL plugin
   - Set environment variables
   - Auto-deploy on push

2. **Render**:
   - Create web service for backend
   - Create static site for frontend
   - Add PostgreSQL database
   - Configure environment variables

3. **Fly.io**:
   - Install flyctl CLI
   - `fly launch` in backend directory
   - `fly postgres create` for database
   - `fly deploy`

**Production Environment Variables:**
```env
# Backend
NODE_ENV=production
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-...
YOUTUBE_API_KEY=AIza...
CORS_ORIGIN=https://your-frontend-domain.com
PORT=4000

# Frontend
VITE_API_URL=https://your-backend-domain.com/api
```

### Step 3.4: Monitoring & Logging (30 min)

**Health Check Endpoint** (already implemented):
- GET `/api/health` - Service status
- GET `/api/sources/status` - Source health

**Logging Best Practices:**
- Use Winston for structured logging
- Log levels: error, warn, info, debug
- Store logs in files for production
- Consider log aggregation service (LogTail, Papertrail)

**Monitoring Checklist:**
- [ ] Database connection monitoring
- [ ] API endpoint uptime
- [ ] Scraper job success/failure rates
- [ ] AI processing queue depth
- [ ] Error rate tracking

---

## Best Practices & Guidelines

### Code Quality

**TypeScript:**
- Enable strict mode
- Use proper types (avoid `any`)
- Define interfaces for all data structures
- Use Zod for runtime validation

**Error Handling:**
- Wrap async operations in try-catch
- Provide user-friendly error messages
- Log errors with context
- Implement retry logic for transient failures

**Performance:**
- Implement pagination for all list endpoints
- Use database indexes on frequently queried columns
- Cache AI processing results
- Debounce search inputs
- Lazy load images

**Security:**
- Never commit API keys or secrets
- Use environment variables for configuration
- Validate all user inputs
- Implement rate limiting for public APIs
- Use HTTPS in production
- Set secure CORS policies

### Git Workflow

**Branch Strategy:**
- `main` - production-ready code
- `develop` - integration branch
- `feature/*` - feature branches
- `bugfix/*` - bug fixes

**Commit Messages:**
```
feat: add YouTube scraper with rate limiting
fix: resolve duplicate detection for similar titles
docs: update API endpoint documentation
refactor: extract scraper factory pattern
test: add unit tests for AI service
```

**Pre-commit Checklist:**
- [ ] Code compiles without errors
- [ ] Tests pass
- [ ] Linting passes
- [ ] No console.logs in production code
- [ ] Environment variables documented

---

## Project File Structure

```
ai-trends-tracker/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── scrapers/
│   │   │   │   ├── base.scraper.ts          # Base scraper interface
│   │   │   │   ├── rss.scraper.ts           # RSS feed scraper
│   │   │   │   ├── youtube.scraper.ts       # YouTube API scraper
│   │   │   │   ├── hackernews.scraper.ts    # Hacker News scraper
│   │   │   │   ├── reddit.scraper.ts        # Reddit scraper
│   │   │   │   └── factory.ts               # Scraper factory
│   │   │   ├── services/
│   │   │   │   ├── ai.service.ts            # Claude API integration
│   │   │   │   ├── trends.service.ts        # Business logic
│   │   │   │   └── deduplication.service.ts # Duplicate detection
│   │   │   ├── routes/
│   │   │   │   ├── trends.routes.ts         # Trends endpoints
│   │   │   │   ├── sources.routes.ts        # Sources endpoints
│   │   │   │   └── stats.routes.ts          # Stats & health
│   │   │   ├── jobs/
│   │   │   │   └── scraper.job.ts           # Cron job scheduler
│   │   │   ├── db/
│   │   │   │   ├── schema.ts                # Drizzle ORM schema
│   │   │   │   ├── index.ts                 # Database connection
│   │   │   │   ├── migrations/              # DB migrations
│   │   │   │   └── seed.ts                  # Initial data seed
│   │   │   ├── utils/
│   │   │   │   └── logger.ts                # Winston logger
│   │   │   └── index.ts                     # Express app entry
│   │   ├── logs/                            # Log files (gitignored)
│   │   ├── .env.example                     # Environment template
│   │   ├── .env                             # Actual config (gitignored)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── drizzle.config.ts
│   │   └── Dockerfile
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── TrendCard.tsx            # Trend card component
│       │   │   ├── TrendModal.tsx           # Detail modal
│       │   │   ├── FilterBar.tsx            # Filter controls
│       │   │   └── Header.tsx               # App header
│       │   ├── pages/
│       │   │   ├── Feed.tsx                 # Main feed page
│       │   │   ├── Bookmarks.tsx            # Bookmarks page
│       │   │   └── Settings.tsx             # Settings page
│       │   ├── services/
│       │   │   └── api.ts                   # API client
│       │   ├── hooks/
│       │   │   └── useTrends.ts             # React Query hooks
│       │   ├── store/
│       │   │   └── useStore.ts              # Zustand store
│       │   ├── types/
│       │   │   └── index.ts                 # TypeScript types
│       │   ├── App.tsx                      # Root component
│       │   ├── main.tsx                     # Entry point
│       │   └── index.css                    # Global styles
│       ├── public/                          # Static assets
│       ├── .env.example
│       ├── .env
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── Dockerfile
│
├── .github/
│   └── workflows/
│       └── ci.yml                           # GitHub Actions CI
├── docker-compose.yml                       # Local development
├── .gitignore
├── README.md
└── IMPLEMENTATION_PLAN.md                   # This file
```

---

## Detailed Implementation Timeline

### Phase 1: Backend Foundation (Days 1-2, ~12-14 hours)

#### Day 1: Core Backend (6-8 hours)

**Morning (3-4 hours):**
- [ ] Project initialization (30 min)
  - Initialize backend package.json
  - Install dependencies
  - Configure TypeScript
  - Set up environment variables
- [ ] Database setup (1 hour)
  - Install Drizzle ORM
  - Create schema.ts with all tables
  - Generate and run migrations
  - Create seed script
- [ ] Scraper infrastructure (2 hours)
  - Implement BaseScraper interface
  - Create RSS scraper
  - Create YouTube scraper
  - Create scraper factory

**Afternoon (3-4 hours):**
- [ ] Additional scrapers (1.5 hours)
  - Implement Hacker News scraper
  - Implement Reddit scraper
  - Test each scraper individually
- [ ] Deduplication service (1 hour)
  - URL normalization
  - Title similarity detection
  - Filter duplicates function
- [ ] Core services (1.5 hours)
  - Start TrendsService
  - Basic CRUD operations
  - Refresh logic

#### Day 2: API & AI Integration (6-8 hours)

**Morning (3-4 hours):**
- [ ] AI processing service (2 hours)
  - Implement AIService with Claude API
  - Content summarization
  - Categorization logic
  - Batch processing
  - Error handling and fallbacks
- [ ] Complete TrendsService (1-2 hours)
  - Filtering and pagination
  - Statistics aggregation
  - Complete refresh logic

**Afternoon (3-4 hours):**
- [ ] API routes (1.5 hours)
  - Trends endpoints
  - Sources endpoints
  - Stats endpoints
  - Request validation with Zod
- [ ] Cron jobs & logging (1 hour)
  - Set up Winston logger
  - Implement scraper cron job
  - AI processing job
- [ ] Testing backend (1 hour)
  - Test API endpoints with Postman/Thunder Client
  - Verify scrapers work
  - Check AI processing
  - Ensure cron jobs start

### Phase 2: Frontend Development (Days 3-4, ~12-14 hours)

#### Day 3: Frontend Foundation (6-8 hours)

**Morning (3-4 hours):**
- [ ] Project setup (30 min)
  - Create Vite + React + TypeScript project
  - Install dependencies
  - Configure TailwindCSS
  - Set up TypeScript paths
- [ ] Types & API client (1 hour)
  - Define all TypeScript interfaces
  - Implement API client functions
  - Set up axios instance
- [ ] State management (1 hour)
  - Create Zustand store
  - Set up React Query
  - Implement custom hooks
- [ ] Core components (1-2 hours)
  - Header component
  - FilterBar component

**Afternoon (3-4 hours):**
- [ ] Main components (3-4 hours)
  - TrendCard component
  - TrendModal component
  - Feed page with pagination
  - Basic styling with Tailwind

#### Day 4: UI Polish & Features (6-8 hours)

**Morning (3-4 hours):**
- [ ] Additional pages (2 hours)
  - Bookmarks page
  - Settings page
  - Routing setup
- [ ] UI refinement (1-2 hours)
  - Responsive design testing
  - Dark mode implementation
  - Loading states
  - Error states

**Afternoon (3-4 hours):**
- [ ] User interactions (2 hours)
  - Mark as read functionality
  - Bookmark toggle
  - Refresh button
  - Search and filters
- [ ] Testing & bug fixes (1-2 hours)
  - Test all user flows
  - Cross-browser testing
  - Mobile responsiveness
  - Fix issues

### Phase 3: Production Ready (Day 5, ~6-8 hours)

#### Day 5: Deployment & Polish (6-8 hours)

**Morning (3-4 hours):**
- [ ] Docker setup (1 hour)
  - Create docker-compose.yml
  - Backend Dockerfile
  - Frontend Dockerfile
  - Test local Docker deployment
- [ ] Production builds (1 hour)
  - Build backend for production
  - Build frontend for production
  - Optimize bundle sizes
- [ ] Testing (1-2 hours)
  - Write unit tests for critical functions
  - Integration tests for API endpoints
  - E2E test for main user flow

**Afternoon (3-4 hours):**
- [ ] Deployment (2-3 hours)
  - Choose hosting platform (Railway/Render/Fly.io)
  - Set up PostgreSQL database
  - Deploy backend
  - Deploy frontend
  - Configure environment variables
  - Set up custom domain (optional)
- [ ] Documentation (1 hour)
  - Update README.md
  - API documentation
  - Setup instructions
  - Deployment guide

**Total Time: 30-36 hours (realistic 5-day timeline)**

---

## Success Metrics

### MVP Launch Checklist

**Functionality:**
- [ ] Backend scrapes from at least 5 sources
- [ ] AI summarization works for all content
- [ ] Deduplication prevents duplicates
- [ ] Frontend displays trends in card layout
- [ ] Filters work (source, category, read/unread)
- [ ] Search functionality works
- [ ] Mark as read/unread works
- [ ] Bookmark functionality works
- [ ] Pagination works
- [ ] Refresh button triggers manual scrape
- [ ] Dark mode toggles correctly

**Performance:**
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] No console errors in production
- [ ] Database queries optimized with indexes
- [ ] Images lazy load

**Quality:**
- [ ] TypeScript strict mode with no errors
- [ ] No linting errors
- [ ] Responsive on mobile, tablet, desktop
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Error handling for failed requests

**Production:**
- [ ] Environment variables secured
- [ ] Database backed up
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Health check endpoint working
- [ ] Logs being collected

### Post-MVP Enhancements (Future Iterations)

**Week 2-3 Features:**
- Email notifications for high-value content
- Weekly digest generation
- Related trends suggestions
- Export bookmarks to Markdown/PDF
- Collections/folders for organization
- User preferences persistence

**Month 2 Features:**
- Multi-user support with authentication
- Personalized feed based on reading history
- Chrome extension
- Mobile app (React Native)
- Advanced search with filters
- Trending topics detection
- RSS feed output for custom readers

---

---

## Common Issues & Solutions

### Development Issues

**Issue: Database connection fails**
- Solution: Check DATABASE_URL in .env
- Ensure PostgreSQL is running (docker-compose up postgres)
- Verify credentials match

**Issue: Scrapers failing**
- RSS: Check feed URL is valid
- YouTube: Verify API key is correct and has quota
- Reddit: Ensure User-Agent is set
- Hacker News: No auth needed, check network

**Issue: AI processing errors**
- Solution: Verify ANTHROPIC_API_KEY is valid
- Check API rate limits
- Implement fallback for failed processing
- Monitor token usage

**Issue: CORS errors in frontend**
- Solution: Add frontend URL to CORS_ORIGIN in backend .env
- Ensure backend is running on correct port
- Check axios baseURL matches backend

**Issue: Build fails**
- Solution: Delete node_modules and reinstall
- Clear TypeScript cache (.tsbuildinfo)
- Check for missing dependencies
- Verify Node.js version (18+)

### Deployment Issues

**Issue: Environment variables not loading**
- Solution: Verify all required vars are set in platform
- Check for typos in variable names
- Restart the service after adding vars

**Issue: Database migrations fail**
- Solution: Run migrations manually: `npx drizzle-kit migrate`
- Check database connection string
- Ensure database exists and is accessible

**Issue: Build succeeds but app crashes**
- Solution: Check application logs
- Verify all dependencies are in `dependencies` not `devDependencies`
- Ensure PORT environment variable is set

---

## Cost Estimation

### API Costs (Monthly)

**Anthropic Claude API:**
- Model: Claude 3.5 Sonnet
- Estimated usage: 1000 articles/day × 500 tokens/article
- Input: $3 per million tokens
- Output: $15 per million tokens
- **Estimated: $15-30/month** (with caching)

**YouTube Data API:**
- Free tier: 10,000 units/day
- MVP usage: ~100-200 units/day
- **Cost: $0/month** (within free tier)

**Reddit API:**
- Free for read-only access
- **Cost: $0/month**

**Hosting (Railway/Render):**
- Database: PostgreSQL (512MB) - $5/month
- Backend: Web service - $5/month
- Frontend: Static site - $0/month
- **Total: $10/month**

**Total Monthly Cost: ~$25-40/month**

### Cost Optimization Tips

1. **Cache AI responses** - Don't re-process same content
2. **Batch AI requests** - Process in groups to reduce API calls
3. **Use relevance filtering** - Only process high-quality content
4. **Monitor usage** - Set up alerts for unexpected spikes
5. **Consider alternative models** - Claude Haiku for simpler summaries

---

## Team Collaboration Guide

### Role Distribution (if working with a team)

**Backend Developer:**
- Database schema and migrations
- Scraper implementation
- API endpoints
- Cron jobs
- Testing backend logic

**Frontend Developer:**
- Component development
- State management
- API integration
- UI/UX implementation
- Responsive design

**Full-Stack Developer:**
- Can handle both backend and frontend
- Integration testing
- Deployment
- DevOps

### Development Workflow

1. **Sprint Planning:**
   - Use GitHub Projects or Trello
   - Create issues for each feature
   - Assign based on expertise

2. **Code Review:**
   - All PRs require review before merge
   - Check for code quality, tests, documentation
   - Run automated checks (linting, tests)

3. **Daily Standup:**
   - What was completed yesterday
   - What will be done today
   - Any blockers

4. **Testing:**
   - Backend: Unit tests for services
   - Frontend: Component tests
   - Integration: E2E for critical flows

---

## Learning Resources

### Technologies Used

**Backend:**
- [Express.js Documentation](https://expressjs.com/)
- [Drizzle ORM Guide](https://orm.drizzle.team/docs/overview)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

**Frontend:**
- [React Documentation](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

**DevOps:**
- [Docker Documentation](https://docs.docker.com/)
- [Railway Docs](https://docs.railway.app/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)

---

## Why This Project is Resume-Worthy

### Technical Skills Demonstrated

1. **Full-Stack Development**
   - Backend: Node.js, Express, TypeScript
   - Frontend: React, TypeScript, TailwindCSS
   - Database: PostgreSQL with ORM

2. **AI Integration**
   - Claude API for content analysis
   - Intelligent categorization and summarization
   - Handling rate limits and costs

3. **Data Engineering**
   - Web scraping from multiple sources
   - Data deduplication
   - ETL pipeline (Extract, Transform, Load)

4. **System Design**
   - Scalable architecture
   - Job scheduling with cron
   - Error handling and retry logic

5. **Modern Development Practices**
   - TypeScript for type safety
   - Git version control
   - Docker containerization
   - Automated testing
   - CI/CD pipeline

6. **Production Deployment**
   - Cloud hosting (Railway/Render)
   - Environment configuration
   - Monitoring and logging
   - Database management

### Interview Talking Points

**"Tell me about a challenging project you've worked on"**
- Aggregating data from 10+ sources with different formats
- Implementing intelligent deduplication across sources
- Managing AI API costs while maintaining quality
- Building responsive UI that handles large datasets

**"How do you handle errors in production?"**
- Structured logging with Winston
- Graceful degradation when sources fail
- Retry logic with exponential backoff
- Health check endpoints for monitoring

**"Describe your development process"**
- Start with planning and database design
- Build backend API first, test with Postman
- Develop frontend components iteratively
- Containerize with Docker for consistency
- Deploy to production with CI/CD

---

## Final Checklist Before Launch

### Pre-Launch Verification

**Code Quality:**
- [ ] All TypeScript errors resolved
- [ ] No console.log or debug code
- [ ] Linting passes
- [ ] Comments added for complex logic
- [ ] README.md is complete

**Security:**
- [ ] No API keys in code
- [ ] .env files in .gitignore
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] SQL injection prevented (using ORM)

**Testing:**
- [ ] All scrapers tested with real data
- [ ] API endpoints respond correctly
- [ ] Frontend handles loading/error states
- [ ] Mobile responsive testing done
- [ ] Cross-browser compatibility checked

**Performance:**
- [ ] Database indexes created
- [ ] Images optimized and lazy loaded
- [ ] Bundle size reasonable (<500KB)
- [ ] API responses cached where appropriate
- [ ] No memory leaks

**Deployment:**
- [ ] Production builds successful
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Health checks working
- [ ] Domain configured (if applicable)
- [ ] SSL certificate active

**Documentation:**
- [ ] README with setup instructions
- [ ] API endpoints documented
- [ ] Environment variables listed
- [ ] Deployment guide written
- [ ] Known issues documented

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building a production-ready AI Trends Tracker in 5 days. The project demonstrates full-stack development skills, AI integration, and modern best practices.

**Key Takeaways:**
- Start with solid backend foundation
- Test each component individually
- Focus on user experience in frontend
- Plan for errors and edge cases
- Document as you build
- Deploy early and iterate

**Success Factors:**
1. ✅ Realistic timeline with buffer
2. ✅ Clear separation of concerns
3. ✅ Production-ready from day one
4. ✅ Scalable architecture
5. ✅ Cost-effective solution
6. ✅ Practical and useful application

**Next Steps:**
1. Review this plan thoroughly
2. Set up development environment
3. Start with Phase 1, Day 1
4. Track progress with TODO lists
5. Commit regularly to Git
6. Deploy MVP within 5 days
7. Gather feedback and iterate

Good luck building your AI Trends Tracker! 🚀

---

**Document Version:** 2.0
**Last Updated:** 2026-01-28
**Estimated Implementation Time:** 30-36 hours
**Difficulty Level:** Intermediate to Advanced
**Team Size:** 1-3 developers
