# AI Trends Tracker - Implementation Plan

This document provides a detailed, step-by-step implementation guide for building the AI Trends Tracker application. Each phase is broken down into actionable tasks with clear deliverables.

---

## Phase 1: Setup & Infrastructure

### 1.1 Development Environment

#### 1.1.1 Prerequisites Verification

- [x] Verify Node.js >= 20.x installed (`node --version`)
- [x] Verify npm >= 10.x installed (`npm --version`)
- [x] Verify Git installed and configured (`git --version`)

#### 1.1.2 Project Initialization

- [x] Initialize Git repository (if not already done)
- [x] Create `.gitignore` with Node.js, environment files, and IDE-specific entries
- [x] Create project root structure:
  ```
  ai-trends-tracker/
  ├── backend/
  ├── frontend/
  ├── .gitignore
  └── README.md
  ```

### 1.2 External Services & API Keys

#### 1.2.1 Supabase Setup (Database)

- [x] Create Supabase account at [supabase.com](https://supabase.com)
- [x] Create new project `ai-trends-tracker`
- [x] Set and securely store database password
- [x] Navigate to **Settings → Database** and copy:
  - Pooled connection string (port 6543) → `DATABASE_URL`
  - Direct connection string (port 5432) → `DIRECT_URL`
- [x] Document connection strings in password manager

#### 1.2.2 Anthropic API Setup (Claude)

- [x] Create Anthropic account at [console.anthropic.com](https://console.anthropic.com)
- [x] Generate API key
- [x] Store API key securely → `ANTHROPIC_API_KEY`
- [x] Note: Claude 3.5 Haiku model ID: `claude-haiku-4-5-20251001`

#### 1.2.3 Vercel Setup (Deployment - Optional for MVP)

- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Link GitHub repository
- [ ] Note: Requires `server.ts` to exist before deployment will succeed
- [ ] Note: Detailed deployment configuration in Phase 3

### 1.3 Backend Project Setup

#### 1.3.1 Initialize Backend

- [x] Create `backend/` directory structure:
  ```
  backend/
  ├── src/
  │   ├── controllers/
  │   ├── services/
  │   ├── middleware/
  │   ├── schemas/
  │   ├── utils/
  │   ├── routes/
  │   └── prisma/
  ├── tests/
  ├── package.json
  └── tsconfig.json
  ```
- [x] Initialize npm project: `npm init -y`
- [x] Install production dependencies:
  ```bash
  npm install express @prisma/client @anthropic-ai/sdk @extractus/article-extractor rss-parser zod cors helmet dotenv
  ```
- [x] Install dev dependencies:
  ```bash
  npm install -D typescript prisma vitest @types/express @types/cors @types/node tsx
  ```

#### 1.3.2 TypeScript Configuration

- [x] Create `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "lib": ["ES2022"],
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "resolveJsonModule": true,
      "declaration": true,
      "declarationMap": true,
      "sourceMap": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "tests"]
  }
  ```

#### 1.3.3 Environment Configuration

- [x] Create `backend/.env.example`:

  ```env
  # Database (Supabase)
  DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
  DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

  # Anthropic API
  ANTHROPIC_API_KEY=sk-ant-...

  # Server
  PORT=3001
  NODE_ENV=development
  ```

- [x] Create `backend/.env` with actual values (do NOT commit)

#### 1.3.4 Package.json Scripts

- [x] Add scripts to `package.json`:
  ```json
  {
    "scripts": {
      "dev": "tsx watch src/server.ts",
      "build": "tsc",
      "start": "node dist/server.js",
      "test": "vitest",
      "test:watch": "vitest --watch",
      "db:generate": "prisma generate",
      "db:push": "prisma db push",
      "db:seed": "tsx src/prisma/seed.ts",
      "db:studio": "prisma studio"
    }
  }
  ```

### 1.4 Frontend Project Setup

#### 1.4.1 Initialize Frontend with Vite

- [x] Create Vite React project:
  ```bash
  npm create vite@latest frontend -- --template react-ts
  cd frontend
  npm install
  ```
- [x] Install additional dependencies:
  ```bash
  npm install @tanstack/react-query axios
  npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
  ```

#### 1.4.2 Tailwind CSS Configuration (Updated for v4)

- [x] Install Tailwind v4 Vite plugin: `npm install -D @tailwindcss/vite`
- [x] Configure `vite.config.ts` with Tailwind plugin
- [x] Update `src/index.css`:
  ```css
  @import "tailwindcss";
  ```

#### 1.4.3 Frontend Environment

- [x] Create `frontend/.env.example`:
  ```env
  VITE_API_URL=http://localhost:3001/api
  ```
- [x] Create `frontend/.env` with actual values

#### 1.4.4 Frontend Project Structure

- [x] Create directory structure:
  ```
  frontend/src/
  ├── components/
  ├── hooks/
  ├── services/
  ├── types/
  ├── App.tsx
  ├── main.tsx
  └── index.css
  ```

### 1.5 Database Schema Setup

#### 1.5.1 Prisma Initialization

- [x] Create `backend/prisma/schema.prisma` with MVP schema:

  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
  }

  model Source {
    id         String    @id @default(uuid())
    name       String    @unique @db.VarChar(100)
    slug       String    @unique @db.VarChar(50)
    type       String    @default("rss") @db.VarChar(20)
    feedUrl    String?   @map("feed_url")
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
    title        String    @db.VarChar(500)
    url          String    @unique
    summary      String?
    contentHash  String    @map("content_hash") @db.VarChar(64)
    publishedAt  DateTime  @map("published_at")
    fetchedAt    DateTime  @default(now()) @map("fetched_at")
    summarizedAt DateTime? @map("summarized_at")
    createdAt    DateTime  @default(now()) @map("created_at")

    source       Source    @relation(fields: [sourceId], references: [id])

    @@index([sourceId])
    @@index([publishedAt(sort: Desc)])
    @@index([contentHash])
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
  ```

#### 1.5.2 Database Migration

- [x] Generate Prisma client: `npm run db:generate`
- [x] Push schema to database (via Supabase MCP due to direct connection restrictions)
- [x] Verify tables created in Supabase dashboard

#### 1.5.3 Seed Data

- [x] Create `backend/src/prisma/seed.ts`:

  ```typescript
  import { PrismaClient } from "@prisma/client";

  const prisma = new PrismaClient();

  const sources = [
    {
      name: "TechCrunch AI",
      slug: "techcrunch-ai",
      feedUrl: "https://techcrunch.com/category/artificial-intelligence/feed/",
      websiteUrl: "https://techcrunch.com/category/artificial-intelligence/",
    },
    {
      name: "VentureBeat AI",
      slug: "venturebeat-ai",
      feedUrl: "https://venturebeat.com/category/ai/feed/",
      websiteUrl: "https://venturebeat.com/category/ai/",
    },
    {
      name: "MIT Technology Review",
      slug: "mit-tech-review",
      feedUrl:
        "https://www.technologyreview.com/topic/artificial-intelligence/feed",
      websiteUrl:
        "https://www.technologyreview.com/topic/artificial-intelligence/",
    },
    {
      name: "The Verge AI",
      slug: "verge-ai",
      feedUrl:
        "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
      websiteUrl: "https://www.theverge.com/ai-artificial-intelligence",
    },
    {
      name: "Ars Technica AI",
      slug: "ars-technica-ai",
      feedUrl: "https://feeds.arstechnica.com/arstechnica/features",
      websiteUrl: "https://arstechnica.com/",
    },
    {
      name: "Wired AI",
      slug: "wired-ai",
      feedUrl: "https://www.wired.com/feed/tag/ai/latest/rss",
      websiteUrl: "https://www.wired.com/tag/ai/",
    },
  ];

  async function main() {
    console.log("Seeding sources...");

    for (const source of sources) {
      await prisma.source.upsert({
        where: { slug: source.slug },
        update: source,
        create: source,
      });
    }

    console.log("Seeding complete!");
  }

  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
  ```

- [x] Run seed: `npm run db:seed`
- [x] Verify sources in database (6 RSS sources seeded)

### 1.6 Phase 1 Verification Checklist

- [x] Backend `npm run dev` starts without errors (requires server.ts from Phase 2)
- [x] Frontend `npm run dev` starts and shows default Vite page
- [x] Database connection works (verified via Prisma seed & Supabase MCP)
- [x] All 6 RSS sources seeded in database
- [x] Environment variables properly configured
- [x] Git repository initialized

---

## Phase 2: MVP Backend Implementation

### 2.1 Core Infrastructure

#### 2.1.1 Express Application Setup

- [x] Create `backend/src/app.ts`:
  - Initialize Express app
  - Configure CORS middleware
  - Configure Helmet for security headers
  - Configure JSON body parser
  - Set up error handling middleware
  - Export app instance

#### 2.1.2 Server Entry Point

- [x] Create `backend/src/server.ts`:
  - Import app from `app.ts`
  - Configure port from environment
  - Start server with logging
  - Handle graceful shutdown

#### 2.1.3 Prisma Client Singleton

- [x] Create `backend/src/utils/prisma.ts`:
  - Create singleton Prisma client instance
  - Handle connection in development (prevent multiple instances)
  - Export prisma client

#### 2.1.4 Logger Utility

- [x] Create `backend/src/utils/logger.ts`:
  - Create simple console logger with timestamps
  - Support log levels: info, warn, error, debug
  - Format: `[TIMESTAMP] [LEVEL] message`

#### 2.1.5 Hash Utility

- [x] Create `backend/src/utils/hash.ts`:
  - Create `generateContentHash(url: string, title: string): string`
  - Use SHA-256 for deduplication

### 2.2 Zod Validation Schemas

#### 2.2.1 API Schemas

- [x] Create `backend/src/schemas/api.schemas.ts`:

  ```typescript
  // Query parameter schemas
  - ArticleQuerySchema: { source?: string, page?: number, limit?: number }
  - ArticleIdSchema: { id: string (uuid) }

  // Response schemas (for documentation/typing)
  - ArticleResponseSchema
  - SourceResponseSchema
  - PaginationSchema
  - ApiSuccessSchema
  - ApiErrorSchema
  ```

### 2.3 Middleware

#### 2.3.1 Validation Middleware

- [x] Create `backend/src/middleware/validation.middleware.ts`:
  - `validateQuery(schema)` - validates request query params
  - `validateParams(schema)` - validates route params
  - `validateBody(schema)` - validates request body
  - Return 400 with Zod errors on validation failure

#### 2.3.2 Error Handling Middleware

- [x] Create `backend/src/middleware/error.middleware.ts`:
  - Global error handler
  - Format errors consistently: `{ success: false, error: { code, message } }`
  - Log errors with stack traces in development
  - Hide stack traces in production

### 2.4 Services Layer

#### 2.4.1 RSS Service

- [x] Create `backend/src/services/rss.service.ts`:

  ```typescript
  interface RSSItem {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet?: string;
    guid?: string;
  }

  async function fetchFeed(feedUrl: string): Promise<RSSItem[]>
  - Use rss-parser to fetch and parse feed
  - Handle feed fetch errors gracefully
  - Return parsed items array
  ```

#### 2.4.2 Scraper Service

- [x] Create `backend/src/services/scraper.service.ts`:

  ```typescript
  interface ScrapedArticle {
    title: string;
    content: string;
    author?: string;
    published?: string;
    description?: string;
  }

  async function scrapeArticle(url: string): Promise<ScrapedArticle | null>
  - Use @extractus/article-extractor
  - Handle scrape failures (return null)
  - Implement rate limiting (1 req/sec per domain)

  async function refreshSource(sourceId: string): Promise<RefreshResult>
  - Fetch RSS feed for source
  - For each item:
    - Generate content hash
    - Check if article exists (skip duplicates)
    - Scrape full article content
    - Store in database
  - Return stats: { found, new, errors }

  async function refreshAllSources(): Promise<RefreshResult>
  - Get all active sources
  - Refresh each source sequentially
  - Aggregate and return results
  ```

#### 2.4.3 Summarizer Service

- [x] Create `backend/src/services/summarizer.service.ts`:

  ```typescript
  async function summarizeArticle(content: string): Promise<string>
  - Initialize Anthropic client
  - Send content to Claude 3.5 Haiku
  - System prompt: Focus on key developments, implications, why it matters
  - Max tokens: 300
  - Handle API errors with retry (max 3 attempts, exponential backoff)
  - Return summary text

  async function summarizeUnsummarized(limit?: number): Promise<number>
  - Query articles where summary is null
  - Summarize each article
  - Update database with summary and summarizedAt timestamp
  - Return count of summarized articles
  ```

### 2.5 Controllers

#### 2.5.1 Articles Controller

- [x] Create `backend/src/controllers/articles.controller.ts`:

  ```typescript
  async function listArticles(req, res)
  - Parse query params: source (slug), page (default 1), limit (default 20)
  - Build Prisma where clause
  - Query articles with source relation
  - Return paginated response with total count

  async function getArticle(req, res)
  - Parse article ID from params
  - Query single article with source relation
  - Return 404 if not found
  - Return article data
  ```

#### 2.5.2 Sources Controller

- [x] Create `backend/src/controllers/sources.controller.ts`:
  ```typescript
  async function listSources(req, res)
  - Query all active sources
  - Include article count per source
  - Return sources array
  ```

#### 2.5.3 Refresh Controller

- [x] Create `backend/src/controllers/refresh.controller.ts`:

  ```typescript
  async function triggerRefresh(req, res)
  - Create fetch record with status 'running'
  - Call refreshAllSources()
  - Call summarizeUnsummarized()
  - Update fetch record with results and status 'completed'
  - Handle errors: update status to 'failed' with error message
  - Return refresh results

  async function getRefreshStatus(req, res)
  - Query latest fetch record
  - Return status and stats
  ```

### 2.6 Routes

#### 2.6.1 Route Definitions

- [x] Create `backend/src/routes/index.ts`:

  ```typescript
  // Articles routes
  GET  /api/articles      → articlesController.listArticles
  GET  /api/articles/:id  → articlesController.getArticle

  // Sources routes
  GET  /api/sources       → sourcesController.listSources

  // Refresh routes
  POST /api/refresh       → refreshController.triggerRefresh
  GET  /api/refresh/status → refreshController.getRefreshStatus
  ```

- [x] Apply validation middleware to routes
- [x] Register routes in app.ts

### 2.7 Testing

#### 2.7.1 Test Setup

- [x] Create `backend/vitest.config.ts`:

  ```typescript
  import { defineConfig } from "vitest/config";

  export default defineConfig({
    test: {
      globals: true,
      environment: "node",
      include: ["tests/**/*.test.ts"],
      coverage: {
        reporter: ["text", "json", "html"],
      },
    },
  });
  ```

#### 2.7.2 Unit Tests

- [x] Create `backend/tests/services/rss.service.test.ts`:
  - Test feed parsing
  - Test error handling for invalid feeds

- [x] Create `backend/tests/services/scraper.service.test.ts`:
  - Test article scraping
  - Test duplicate detection
  - Test error handling

- [x] Create `backend/tests/utils/hash.test.ts`:
  - Test hash generation consistency
  - Test unique hashes for different inputs

#### 2.7.3 Integration Tests

- [ ] Create `backend/tests/controllers/articles.controller.test.ts`:
  - Test GET /api/articles (pagination, filtering)
  - Test GET /api/articles/:id (found, not found)

- [ ] Create `backend/tests/controllers/sources.controller.test.ts`:
  - Test GET /api/sources

### 2.8 Phase 2 Verification Checklist

- [x] `GET /api/sources` returns seeded sources
- [x] `POST /api/refresh` fetches articles from RSS feeds
- [x] Articles are deduplicated (no duplicates on re-fetch)
- [x] Articles are summarized by Claude
- [x] `GET /api/articles` returns paginated articles with summaries
- [x] `GET /api/articles?source=techcrunch-ai` filters correctly
- [x] `GET /api/articles/:id` returns single article
- [x] `GET /api/refresh/status` shows latest fetch status
- [x] All tests pass: `npm test`
- [x] Error responses follow standard format

---

## Phase 3: MVP Frontend Implementation

### 3.1 Core Setup

#### 3.1.1 API Client

- [ ] Create `frontend/src/services/api.ts`:
  ```typescript
  - Create Axios instance with baseURL from env
  - Add response interceptor for error handling
  - Export typed API methods:
    - getArticles(params): Promise<PaginatedArticles>
    - getArticle(id): Promise<Article>
    - getSources(): Promise<Source[]>
    - triggerRefresh(): Promise<RefreshResult>
    - getRefreshStatus(): Promise<RefreshStatus>
  ```

#### 3.1.2 TypeScript Types

- [ ] Create `frontend/src/types/index.ts`:

  ```typescript
  interface Source {
    id: string;
    name: string;
    slug: string;
    websiteUrl: string;
    articleCount?: number;
  }

  interface Article {
    id: string;
    title: string;
    url: string;
    summary: string | null;
    publishedAt: string;
    source: Source;
  }

  interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }

  interface RefreshStatus {
    id: string;
    status: "pending" | "running" | "completed" | "failed";
    articlesFound: number;
    articlesNew: number;
    startedAt: string;
    completedAt: string | null;
  }
  ```

#### 3.1.3 React Query Setup

- [ ] Update `frontend/src/main.tsx`:
  - Create QueryClient instance
  - Wrap App with QueryClientProvider
  - Configure default options (staleTime, retry)

### 3.2 Custom Hooks

#### 3.2.1 useArticles Hook

- [ ] Create `frontend/src/hooks/useArticles.ts`:
  ```typescript
  function useArticles(params: { source?: string; page?: number; limit?: number })
  - Use useQuery with ['articles', params] key
  - Call api.getArticles(params)
  - Return { data, isLoading, error, refetch }
  ```

#### 3.2.2 useSources Hook

- [ ] Create `frontend/src/hooks/useSources.ts`:
  ```typescript
  function useSources()
  - Use useQuery with ['sources'] key
  - Call api.getSources()
  - Set staleTime to 5 minutes (sources rarely change)
  ```

#### 3.2.3 useRefresh Hook

- [ ] Create `frontend/src/hooks/useRefresh.ts`:
  ```typescript
  function useRefresh()
  - Use useMutation for triggerRefresh
  - Use useQuery for getRefreshStatus (with polling when status is 'running')
  - Invalidate articles query on success
  - Return { refresh, status, isRefreshing }
  ```

### 3.3 Components

#### 3.3.1 Header Component

- [ ] Create `frontend/src/components/Header.tsx`:
  - App title: "AI Trends Tracker"
  - RefreshButton component placement
  - Clean, minimal design
  - Responsive layout

#### 3.3.2 SourceFilter Component

- [ ] Create `frontend/src/components/SourceFilter.tsx`:
  - Display "All Sources" button (default)
  - Display button for each source
  - Highlight active filter
  - Call onSelect callback with source slug
  - Horizontal scrollable on mobile

#### 3.3.3 ArticleCard Component

- [ ] Create `frontend/src/components/ArticleCard.tsx`:
  - Display article title
  - Display source name with icon/badge
  - Display formatted publish date
  - Display summary preview (truncated to 2-3 lines)
  - Clickable to open modal
  - Hover state indication

#### 3.3.4 ArticleGrid Component

- [ ] Create `frontend/src/components/ArticleGrid.tsx`:
  - Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop
  - Map articles to ArticleCard components
  - Handle empty state: "No articles found"
  - Handle loading state: skeleton cards

#### 3.3.5 ArticleModal Component

- [ ] Create `frontend/src/components/ArticleModal.tsx`:
  - Full article summary display
  - Article title as heading
  - Source name and publish date
  - "Read Original" button (opens in new tab)
  - Close button (X) and click-outside-to-close
  - Keyboard accessible (Escape to close)

#### 3.3.6 RefreshButton Component

- [ ] Create `frontend/src/components/RefreshButton.tsx`:
  - "Refresh" button with icon
  - Loading spinner while refreshing
  - Disabled state during refresh
  - Show last refresh time tooltip
  - Toast/notification on completion

#### 3.3.7 Pagination Component

- [ ] Create `frontend/src/components/Pagination.tsx`:
  - Previous/Next buttons
  - Page number display: "Page X of Y"
  - Disabled states at boundaries
  - Call onPageChange callback

### 3.4 Main App Layout

#### 3.4.1 App Component

- [ ] Update `frontend/src/App.tsx`:
  ```tsx
  - State: selectedSource, currentPage
  - Layout:
    <Header />
    <main>
      <SourceFilter
        sources={sources}
        selected={selectedSource}
        onSelect={setSelectedSource}
      />
      <ArticleGrid
        articles={articles}
        isLoading={isLoading}
        onArticleClick={openModal}
      />
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </main>
    <ArticleModal
      article={selectedArticle}
      isOpen={isModalOpen}
      onClose={closeModal}
    />
  ```

### 3.5 Styling

#### 3.5.1 Base Styles

- [ ] Update `frontend/src/index.css`:
  - CSS reset/normalize via Tailwind
  - Custom font (Inter or system fonts)
  - Color palette definition
  - Utility classes for common patterns

#### 3.5.2 Component Styling

- [ ] Style each component using Tailwind classes:
  - Consistent spacing scale
  - Card shadows and borders
  - Button hover/active states
  - Modal backdrop and animation
  - Responsive breakpoints

### 3.6 Testing

#### 3.6.1 Test Setup

- [ ] Create `frontend/vitest.config.ts`:

  ```typescript
  import { defineConfig } from "vitest/config";
  import react from "@vitejs/plugin-react";

  export default defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./tests/setup.ts",
    },
  });
  ```

- [ ] Create `frontend/tests/setup.ts`:
  ```typescript
  import "@testing-library/jest-dom";
  ```

#### 3.6.2 Component Tests

- [ ] Create `frontend/tests/components/ArticleCard.test.tsx`:
  - Renders article title
  - Renders source name
  - Renders formatted date
  - Calls onClick when clicked

- [ ] Create `frontend/tests/components/SourceFilter.test.tsx`:
  - Renders all sources
  - Highlights selected source
  - Calls onSelect with correct slug

- [ ] Create `frontend/tests/components/Pagination.test.tsx`:
  - Disables Previous on first page
  - Disables Next on last page
  - Calls onPageChange with correct page

### 3.7 Deployment Preparation

#### 3.7.1 Backend Vercel Configuration

- [ ] Create `backend/vercel.json`:
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

#### 3.7.2 Environment Variables (Production)

- [ ] Configure in Vercel dashboard:
  - `DATABASE_URL` - Supabase pooled connection
  - `DIRECT_URL` - Supabase direct connection
  - `ANTHROPIC_API_KEY` - Claude API key
  - `NODE_ENV=production`

#### 3.7.3 Frontend Production Build

- [ ] Test production build: `npm run build`
- [ ] Test preview: `npm run preview`
- [ ] Configure `VITE_API_URL` for production

### 3.8 Phase 3 Verification Checklist

- [ ] Frontend loads and displays articles from API
- [ ] Source filter works correctly
- [ ] Pagination navigates through articles
- [ ] Article modal opens and displays full summary
- [ ] "Read Original" opens article in new tab
- [ ] Refresh button fetches new articles
- [ ] Loading states display correctly
- [ ] Empty states display correctly
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] All component tests pass
- [ ] Production build succeeds
- [ ] Deployed and accessible online

---

## Phase 4: V1 - Core Enhancements

### 4.1 Database Schema Updates

#### 4.1.1 Add Content Type Field

- [ ] Update Prisma schema:

  ```prisma
  model Article {
    // ... existing fields
    type String @default("article") @db.VarChar(20)  // 'article' | 'video'

    @@index([type])
  }

  model Source {
    // ... existing fields
    channelId String? @map("channel_id") @db.VarChar(50)  // For YouTube
  }
  ```

- [ ] Run migration: `npx prisma db push`

### 4.2 YouTube Integration

#### 4.2.1 YouTube Service

- [ ] Create `backend/src/services/youtube.service.ts`:

  ```typescript
  async function getChannelVideos(channelId: string, maxResults: number)
  - Use YouTube Data API v3
  - Fetch recent videos from channel
  - Return video metadata (id, title, description, publishedAt)

  async function getTranscript(videoId: string): Promise<string | null>
  - Use youtube-transcript package
  - Handle videos without transcripts
  - Return combined transcript text

  async function refreshYouTubeSource(sourceId: string): Promise<RefreshResult>
  - Fetch videos from channel
  - For each video:
    - Check if exists (skip duplicates)
    - Fetch transcript
    - Store with type='video'
  - Return stats
  ```

#### 4.2.2 YouTube Sources Seed

- [ ] Add YouTube sources to seed:
  ```typescript
  {
    name: 'Two Minute Papers',
    slug: 'two-minute-papers',
    type: 'youtube',
    channelId: 'UCbfYPyITQ-7l4upoX8nvctg',
    websiteUrl: 'https://youtube.com/@TwoMinutePapers',
  },
  {
    name: 'Andrej Karpathy',
    slug: 'andrej-karpathy',
    type: 'youtube',
    channelId: 'UCXUPKJO5MZQN11PqgIvyuvQ',
    websiteUrl: 'https://youtube.com/@AndrejKarpathy',
  },
  // ... more channels
  ```

#### 4.2.3 Environment Variables

- [ ] Add to `.env.example`:
  ```env
  YOUTUBE_API_KEY=AIza...
  ```

### 4.3 Hacker News Integration

#### 4.3.1 Hacker News Service

- [ ] Create `backend/src/services/hackernews.service.ts`:

  ```typescript
  const AI_KEYWORDS = ['ai', 'llm', 'gpt', 'claude', 'openai', ...]

  async function fetchTopStories(limit: number): Promise<HNStory[]>
  - Fetch top story IDs from HN API
  - Fetch story details in parallel
  - Filter for AI-related stories (keyword matching)

  async function refreshHackerNews(): Promise<RefreshResult>
  - Fetch and filter stories
  - For each story:
    - Check if exists
    - If has external URL, scrape article
    - Store in database
  - Return stats
  ```

#### 4.3.2 Hacker News Source Seed

- [ ] Add HN source to seed:
  ```typescript
  {
    name: 'Hacker News',
    slug: 'hackernews',
    type: 'discussion',
    websiteUrl: 'https://news.ycombinator.com',
  }
  ```

### 4.4 Reddit Integration

#### 4.4.1 Reddit Service

- [ ] Create `backend/src/services/reddit.service.ts`:

  ```typescript
  const SUBREDDITS = ['MachineLearning', 'artificial', 'LocalLLaMA']

  async function fetchSubredditPosts(subreddit: string, limit: number)
  - Fetch from Reddit JSON API
  - Include User-Agent header
  - Implement rate limiting (1 req/sec)

  async function getPostContent(post: RedditPost): Promise<string>
  - For text posts: use selftext
  - For link posts: scrape linked article

  async function refreshReddit(): Promise<RefreshResult>
  - Fetch posts from all subreddits
  - For each post:
    - Check if exists
    - Get content
    - Store in database
  - Return stats
  ```

#### 4.4.2 Reddit Sources Seed

- [ ] Add Reddit sources to seed:
  ```typescript
  {
    name: 'r/MachineLearning',
    slug: 'reddit-ml',
    type: 'discussion',
    websiteUrl: 'https://reddit.com/r/MachineLearning',
  },
  // ... more subreddits
  ```

### 4.5 Automated Refresh (Cron Jobs)

#### 4.5.1 Cron Endpoint

- [ ] Create `backend/src/routes/cron.ts`:
  ```typescript
  POST /api/cron/refresh
  - Verify authorization (CRON_SECRET)
  - Call refreshAllSources()
  - Call summarizeUnsummarized()
  - Return results
  ```

#### 4.5.2 Vercel Cron Configuration

- [ ] Update `backend/vercel.json`:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/refresh",
        "schedule": "0 */6 * * *"
      }
    ]
  }
  ```

#### 4.5.3 Environment Variables

- [ ] Add to `.env.example`:
  ```env
  CRON_SECRET=your-secure-secret
  ```

### 4.6 Update Scraper Service

#### 4.6.1 Unified Refresh

- [ ] Update `backend/src/services/scraper.service.ts`:
  ```typescript
  async function refreshAllSources(): Promise<RefreshResult>
  - Get all active sources
  - Route to appropriate service based on type:
    - 'rss' → refreshRSSSource()
    - 'youtube' → refreshYouTubeSource()
    - 'discussion' → refreshHackerNews() or refreshReddit()
  - Aggregate results
  ```

### 4.7 Frontend Updates

#### 4.7.1 Content Type Filter

- [ ] Add type filter to SourceFilter component:
  - "All" | "Articles" | "Videos" | "Discussions"
  - Pass type param to API

#### 4.7.2 Video Card Variant

- [ ] Update ArticleCard for video type:
  - YouTube thumbnail display
  - Play icon overlay
  - Video duration badge

#### 4.7.3 Update API Client

- [ ] Add type parameter to getArticles:
  ```typescript
  getArticles({ source, type, page, limit });
  ```

### 4.8 Phase 4 Verification Checklist

- [ ] YouTube videos are fetched and stored
- [ ] YouTube transcripts are extracted and summarized
- [ ] Hacker News AI stories are fetched
- [ ] Reddit posts are fetched from configured subreddits
- [ ] Content type filter works in UI
- [ ] Video cards display correctly
- [ ] Cron endpoint works with proper auth
- [ ] Scheduled refresh runs every 6 hours
- [ ] All new sources appear in source filter
- [ ] Error handling for API rate limits

---

## Phase 5: V2 - UI & User Features

### 5.1 Database Schema Updates

#### 5.1.1 Add V2 Fields and Tables

- [ ] Update Prisma schema:

  ```prisma
  model Article {
    // ... existing fields
    category String? @db.VarChar(20)  // AI-assigned category

    bookmarks    Bookmark[]
    readHistory  ReadHistory[]

    @@index([category])
  }

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

- [ ] Run migration: `npx prisma db push`

### 5.2 Search Functionality

#### 5.2.1 Full-Text Search Setup

- [ ] Add PostgreSQL full-text search (raw SQL migration):

  ```sql
  ALTER TABLE articles ADD COLUMN search_vector tsvector;
  CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

  CREATE FUNCTION update_search_vector() RETURNS trigger AS $$
  BEGIN
    NEW.search_vector := to_tsvector('english',
      COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.summary, ''));
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER articles_search_update
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();
  ```

#### 5.2.2 Search Endpoint

- [ ] Create `GET /api/articles/search`:
  ```typescript
  - Parse query params: q, page, limit
  - Use Prisma $queryRaw with ts_rank
  - Return ranked, paginated results
  ```

#### 5.2.3 Search UI Component

- [ ] Create `frontend/src/components/SearchBar.tsx`:
  - Text input with search icon
  - Debounced input (300ms)
  - Clear button
  - Loading indicator

#### 5.2.4 useSearch Hook

- [ ] Create `frontend/src/hooks/useSearch.ts`:
  - Query enabled when search term >= 2 chars
  - Cache results for 1 minute
  - Return { results, isSearching }

### 5.3 Advanced Filtering

#### 5.3.1 Filter Schema Update

- [ ] Update `backend/src/schemas/api.schemas.ts`:
  ```typescript
  ArticleFilterSchema = z.object({
    source: z.string().optional(),
    type: z.enum(["article", "video", "discussion"]).optional(),
    category: z.string().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    unread: z.coerce.boolean().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
  });
  ```

#### 5.3.2 Update Articles Controller

- [ ] Enhance `listArticles` with all filters:
  - Build dynamic Prisma where clause
  - Support comma-separated values for multi-select

#### 5.3.3 Filter Panel Component

- [ ] Create `frontend/src/components/FilterPanel.tsx`:
  - Category multi-select
  - Date range picker
  - Content type select
  - Clear all filters button

### 5.4 Content Categorization

#### 5.4.1 Update Summarizer Service

- [ ] Enhance Claude prompt to return category:
  ```typescript
  async function categorizeAndSummarize(content: string): Promise<{
    summary: string;
    category: "News" | "Research" | "Tutorial" | "Opinion" | "Tool";
  }>;
  ```

#### 5.4.2 Category Badges

- [ ] Update ArticleCard with category badge:
  - Color-coded by category
  - Display in card header

### 5.5 Dark Mode

#### 5.5.1 Tailwind Dark Mode Setup

- [ ] Update `tailwind.config.js`:
  ```javascript
  module.exports = {
    darkMode: "class",
    // ...
  };
  ```

#### 5.5.2 Theme Toggle Component

- [ ] Create `frontend/src/components/ThemeToggle.tsx`:
  - Light/Dark/System options
  - Persist preference to localStorage
  - Update document class

#### 5.5.3 Dark Mode Styles

- [ ] Add dark variants to all components:
  ```css
  .card {
    @apply bg-white dark:bg-gray-800;
  }
  .text {
    @apply text-gray-900 dark:text-gray-100;
  }
  ```

### 5.6 Bookmarks (Local Storage MVP)

#### 5.6.1 useBookmarks Hook

- [ ] Create `frontend/src/hooks/useBookmarks.ts`:
  ```typescript
  function useBookmarks()
  - Store bookmarks in localStorage
  - addBookmark(articleId)
  - removeBookmark(articleId)
  - isBookmarked(articleId)
  - exportBookmarks(format: 'json' | 'csv')
  ```

#### 5.6.2 Bookmark Button Component

- [ ] Create `frontend/src/components/BookmarkButton.tsx`:
  - Toggle bookmark state
  - Filled/outline icon states
  - Add to ArticleCard

#### 5.6.3 Bookmarks View

- [ ] Create bookmarks page/filter:
  - Filter to show only bookmarked articles
  - Export button

### 5.7 User Authentication (Optional)

#### 5.7.1 Supabase Auth Setup

- [ ] Configure Supabase Auth in dashboard
- [ ] Create `backend/src/services/auth.service.ts`:
  ```typescript
  -signUp(email, password) -
    signIn(email, password) -
    signOut() -
    getCurrentUser();
  ```

#### 5.7.2 Auth Endpoints

- [ ] Create auth routes:
  ```
  POST /api/auth/signup
  POST /api/auth/login
  POST /api/auth/logout
  GET  /api/auth/me
  ```

#### 5.7.3 Auth Middleware

- [ ] Create `backend/src/middleware/auth.middleware.ts`:
  - Verify JWT token
  - Attach user to request
  - Protect user-specific routes

#### 5.7.4 User Feature Endpoints

- [ ] Create user routes:
  ```
  GET    /api/user/bookmarks
  POST   /api/user/bookmarks/:id
  DELETE /api/user/bookmarks/:id
  POST   /api/user/read/:id
  GET    /api/user/export
  ```

#### 5.7.5 Frontend Auth Integration

- [ ] Create auth context and hooks:
  - useAuth() - current user state
  - Login/Signup forms
  - Protected route wrapper

### 5.8 Phase 5 Verification Checklist

- [ ] Search returns relevant results
- [ ] All filters work correctly
- [ ] Categories are assigned by AI
- [ ] Category filter works
- [ ] Dark mode toggles correctly
- [ ] Theme preference persists
- [ ] Bookmarks save to localStorage
- [ ] Bookmarks export works (JSON/CSV)
- [ ] (Optional) User authentication works
- [ ] (Optional) Cloud bookmarks sync
- [ ] All UI is responsive
- [ ] All tests pass

---

## Appendix A: RSS Feed URLs

| Source                | Feed URL                                                              |
| --------------------- | --------------------------------------------------------------------- |
| TechCrunch AI         | `https://techcrunch.com/category/artificial-intelligence/feed/`       |
| VentureBeat AI        | `https://venturebeat.com/category/ai/feed/`                           |
| MIT Technology Review | `https://www.technologyreview.com/topic/artificial-intelligence/feed` |
| The Verge AI          | `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml`   |
| Ars Technica          | `https://feeds.arstechnica.com/arstechnica/features`                  |
| Wired AI              | `https://www.wired.com/feed/tag/ai/latest/rss`                        |

## Appendix B: YouTube Channel IDs

| Channel           | Channel ID                 |
| ----------------- | -------------------------- |
| Two Minute Papers | `UCbfYPyITQ-7l4upoX8nvctg` |
| Andrej Karpathy   | `UCXUPKJO5MZQN11PqgIvyuvQ` |
| Yannic Kilcher    | `UCZHmQk67mN2dJ5rFUSBU7xQ` |
| AI Explained      | `UCNJ1Ymd5yFuUPtn21xtRbbw` |

## Appendix C: API Error Codes

| Code               | Description                |
| ------------------ | -------------------------- |
| `VALIDATION_ERROR` | Invalid request parameters |
| `NOT_FOUND`        | Resource not found         |
| `INTERNAL_ERROR`   | Server error               |
| `RATE_LIMITED`     | Too many requests          |
| `UNAUTHORIZED`     | Authentication required    |
| `FORBIDDEN`        | Insufficient permissions   |

## Appendix D: Content Categories

| Category | Description                  | Examples                  |
| -------- | ---------------------------- | ------------------------- |
| News     | Industry news, announcements | Product launches, funding |
| Research | Academic papers, studies     | arXiv papers, benchmarks  |
| Tutorial | How-to guides, courses       | Coding tutorials          |
| Opinion  | Analysis, commentary         | Blog posts, editorials    |
| Tool     | Software, libraries          | New frameworks, updates   |

---

**Document Version:** 1.0
**Last Updated:** 2026-02-06
