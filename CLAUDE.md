# AI Trends Tracker - Project Context

## Project Overview

**AI Trends Tracker** is a full-stack web application that aggregates AI-related news, videos, and discussions from multiple sources, then uses Claude AI to generate summaries and intelligent categorization.

**Purpose:** Learn Claude Code features (sub-agents, skills, MCP servers, hooks) while building a practical application.

---

## Architecture

### Monorepo Structure
```
ai-trends-tracker/
├── apps/
│   ├── backend/          # Node.js + Express + PostgreSQL
│   └── frontend/         # React + TypeScript + Vite
├── packages/
│   └── shared/           # Shared TypeScript types
└── .claude/              # Claude Code configuration
    ├── skills/           # Custom slash commands
    ├── hooks/            # Automation scripts
    └── settings.json     # Hook configuration
```

### Tech Stack

**Backend:**
- **Runtime:** Node.js 18+
- **Framework:** Express 4.x
- **Database:** PostgreSQL 15+ (via Drizzle ORM)
- **AI:** Anthropic Claude API
- **APIs:** YouTube Data API, Reddit API, Hacker News API
- **Libraries:** rss-parser, axios, cheerio, node-cron, zod, winston

**Frontend:**
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5.x
- **Styling:** TailwindCSS 3.x
- **State:** Zustand (global) + React Query (server state)
- **Routing:** React Router v6
- **UI:** lucide-react (icons), date-fns (dates)

---

## Development Conventions

### TypeScript
- ✅ **Strict mode enabled** - No implicit any, strict null checks
- ✅ **Shared types** - All API types in `packages/shared/types.ts`
- ✅ **Runtime validation** - Use Zod for API input validation
- ✅ **Prefer interfaces over types** - For object shapes

### Code Style
- **File naming:**
  - Components: `PascalCase.tsx` (e.g., `TrendCard.tsx`)
  - Utilities/services: `camelCase.ts` (e.g., `aiService.ts`)
  - Test files: `*.test.ts` or `__tests__/*.ts`
- **Async/await** - Prefer over Promise chains
- **Error handling** - Always wrap async code in try-catch
- **Logging** - Use Winston logger, never console.log in production

### API Conventions
- **RESTful paths** - Plural nouns, kebab-case: `/api/trends`, `/api/sources`
- **HTTP methods** - GET (read), POST (create), PATCH (update), DELETE (delete)
- **Response format:**
  ```typescript
  {
    data: T,           // Successful response data
    error?: string,    // Error message if failed
    message?: string   // Optional human-readable message
  }
  ```
- **Pagination:**
  ```typescript
  {
    items: T[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
  ```

### Scraper Development
- **Rate limiting:** Max 1 request per second per source
- **Retry logic:** Exponential backoff (1s, 2s, 4s, 8s)
- **Error handling:** Log errors, don't crash entire scraper
- **Data normalization:** Convert all sources to common Trend interface
- **Testing:** Mock HTTP responses, test both success and error cases

### Database
- **ORM:** Drizzle ORM (type-safe, lightweight)
- **Migrations:** Always create both UP and DOWN migrations
- **Indexes:** Add indexes on all frequently queried columns
- **Naming:** snake_case for columns, camelCase in TypeScript

---

## Critical Commands

### Backend Development
```bash
cd apps/backend

# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# TypeScript compilation
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Database migrations
npm run db:generate     # Generate migration from schema changes
npm run db:migrate      # Apply migrations to database
npm run db:seed         # Seed initial data

# Linting
npm run lint
npm run lint:fix
```

### Frontend Development
```bash
cd apps/frontend

# Install dependencies
npm install

# Start development server
npm run dev              # Runs on http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Linting
npm run lint
```

### Docker (Full Stack)
```bash
# Start all services (PostgreSQL, backend, frontend)
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_trends

# APIs
ANTHROPIC_API_KEY=sk-...
YOUTUBE_API_KEY=AIza...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...

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

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000/api
```

**IMPORTANT:** Never commit `.env` files. Always use `.env.example` as a template.

---

## Common Workflows

### Adding a New Scraper
1. Use `/create-scraper` skill: `/create-scraper SourceName Type`
2. Implement scraper logic in generated file
3. Add tests in `__tests__/` directory
4. Register scraper in `scraper.factory.ts`
5. Add source to database seed in `src/db/seed.ts`
6. Test manually: `node -r tsx src/scrapers/sourceName.scraper.ts`
7. Commit (pre-commit hook will run tests automatically)

### Adding a New API Endpoint
1. Use `/api-endpoint` skill: `/api-endpoint METHOD /path description`
2. Implement route logic in `apps/backend/src/routes/`
3. Add controller in `apps/backend/src/controllers/`
4. Add service logic in `apps/backend/src/services/`
5. Add types to `packages/shared/types.ts`
6. Create frontend API client in `apps/frontend/src/services/api.ts`
7. Create React Query hook in `apps/frontend/src/hooks/`
8. Test endpoint with curl or Thunder Client
9. Commit (hooks will validate)

### Database Schema Changes
1. Use `/migration` skill: `/migration description of change`
2. Edit generated migration file with UP and DOWN SQL
3. Update Drizzle schema in `apps/backend/src/db/schema.ts`
4. Update TypeScript types in `packages/shared/types.ts`
5. Run migration: `npm run db:migrate`
6. Test rollback: `npm run db:rollback`
7. Re-apply: `npm run db:migrate`
8. Commit migration files

### Deployment
1. Run `/deploy` skill
2. Skill will:
   - Run tests
   - Build backend and frontend
   - Deploy to hosting platform
   - Run post-deployment checks
3. Monitor logs for errors
4. Verify health endpoints

---

## Data Flow

### Scraping Flow
```
Cron Job (every 6 hours)
  ↓
ScraperService.refreshAllSources()
  ↓
For each active source:
  1. ScraperFactory.create(source)
  2. Scraper.scrape() → RawArticles[]
  3. DeduplicationService.filter() → UniqueArticles[]
  4. Save to database (ai_processed = false)
  ↓
AI Processing Queue
  ↓
For each unprocessed article:
  1. AIService.processContent() → Summary + Category
  2. Update trend with AI insights
  3. Mark ai_processed = true
```

### User Request Flow
```
User visits frontend
  ↓
Frontend: GET /api/trends?filters
  ↓
Backend: TrendsController.getTrends()
  ↓
TrendsService.getTrends(filters)
  ↓
Database query with filters, pagination
  ↓
Return { items, pagination }
  ↓
Frontend: Display in TrendCard components
  ↓
User clicks card → TrendModal opens
  ↓
User bookmarks → PATCH /api/trends/:id/bookmark
  ↓
Database update → Optimistic UI update
```

---

## Testing Strategy

### Backend Tests
- **Unit tests:** Services, utilities (100% coverage goal)
- **Integration tests:** API endpoints with test database
- **Scraper tests:** Mock HTTP responses, test parsers
- **Location:** `apps/backend/src/**/__tests__/*.test.ts`
- **Run:** `npm test`

### Frontend Tests
- **Component tests:** React Testing Library
- **Hook tests:** Test custom React Query hooks
- **E2E tests:** Playwright (optional, for critical flows)
- **Location:** `apps/frontend/src/**/__tests__/*.test.tsx`
- **Run:** `npm test`

### Test Coverage Requirements
- **Minimum:** 80% coverage for services and controllers
- **Critical paths:** 100% coverage (authentication, payments, data mutations)

---

## Debugging Tips

### Backend Debugging
- **Check logs:** `tail -f apps/backend/logs/combined.log`
- **Database queries:** Use PostgreSQL MCP server in Claude
  ```
  Query the database to show recent trends
  ```
- **API testing:** Use Thunder Client or curl
  ```bash
  curl http://localhost:4000/api/health
  ```
- **Debug mode:** `DEBUG=* npm run dev` (verbose logging)

### Frontend Debugging
- **React DevTools:** Install browser extension
- **React Query DevTools:** Enabled in development mode
- **Network tab:** Check API requests/responses
- **Console warnings:** Fix all warnings (TypeScript, React)

### Common Issues
- **Port already in use:** `lsof -ti:4000 | xargs kill -9`
- **Database connection failed:** Check PostgreSQL is running
- **CORS errors:** Verify CORS_ORIGIN in backend .env
- **Missing types:** Run `npm install` in shared package

---

## Security Best Practices

### Never Commit
- ❌ `.env` files with real credentials
- ❌ API keys or secrets
- ❌ Database passwords
- ❌ Private keys

### Always
- ✅ Use `.env.example` as template
- ✅ Validate all user inputs (Zod schemas)
- ✅ Use parameterized queries (Drizzle ORM handles this)
- ✅ Set secure CORS policies
- ✅ Use HTTPS in production
- ✅ Implement rate limiting on public endpoints

---

## Performance Guidelines

### Backend
- **Database:** Add indexes on `published_at`, `source_type`, `category`, `is_read`
- **Caching:** Cache AI summaries (don't reprocess same URL)
- **Batch operations:** Process AI requests in batches of 10
- **Rate limiting:** Respect API limits (YouTube: 10k units/day)

### Frontend
- **Code splitting:** Lazy load routes with React.lazy()
- **Image optimization:** Lazy load images, use responsive images
- **Bundle size:** Keep under 500KB (use `npm run build -- --analyze`)
- **Caching:** React Query caches for 5 minutes

---

## Additional Notes

### Claude Code Features in Use
- **Skills:** `/create-scraper`, `/api-endpoint`, `/migration`, `/deploy`
- **Hooks:** Pre-commit linting, auto-formatting, migration validation
- **MCP Servers:** PostgreSQL (database queries), GitHub (issue management)
- **Sub-agents:** Research, testing, documentation generation

### Resources
- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Full project roadmap
- [Plan](/.claude/plans/floofy-tinkering-jellyfish.md) - Current working plan
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [React Query Docs](https://tanstack.com/query/latest)

---

**Last Updated:** 2026-01-28
**Maintained By:** Claude Code Team
