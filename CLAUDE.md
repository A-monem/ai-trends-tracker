# CLAUDE.md

This file provides context for Claude Code when working on the AI Trends Tracker project.

## Project Overview

AI Trends Tracker is a full-stack web application that aggregates AI news from multiple sources (RSS feeds, YouTube, Reddit, Hacker News) and presents them with AI-powered summaries using Claude 3.5 Haiku.

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + TanStack Query
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **AI**: Claude 3.5 Haiku via Anthropic SDK
- **Validation**: Zod
- **Testing**: Vitest + React Testing Library

## Project Structure

```
ai-trends-tracker/
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic (RSS, scraper, summarizer)
│   │   ├── middleware/    # Express middleware
│   │   ├── schemas/       # Zod validation schemas
│   │   ├── utils/         # Helpers (prisma, logger, hash)
│   │   ├── routes/        # API route definitions
│   │   └── prisma/        # Schema and seed files
│   └── tests/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks (useArticles, useSources, useRefresh)
│   │   ├── services/      # API client
│   │   └── types/         # TypeScript definitions
│   └── tests/
└── docs/              # Project documentation
```

## Common Commands

### Backend (run from `backend/` directory)

```bash
npm run dev          # Start dev server (port 3001)
npm run build        # Build for production
npm run test         # Run tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed RSS sources
npm run db:studio    # Open Prisma Studio
```

### Frontend (run from `frontend/` directory)

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
```

## API Endpoints

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| GET    | `/api/articles`       | List articles (paginated) |
| GET    | `/api/articles/:id`   | Get single article        |
| GET    | `/api/sources`        | List all sources          |
| POST   | `/api/refresh`        | Trigger content refresh   |
| GET    | `/api/refresh/status` | Get refresh status        |

## Database Models

- **Source**: RSS feeds and other content sources
- **Article**: Aggregated articles with AI summaries
- **Fetch**: Tracks refresh operations

## Key Patterns

### API Response Format

```typescript
// Success
{ success: true, data: {...} }

// Paginated
{ success: true, data: [...], pagination: { page, limit, total, totalPages } }

// Error
{ success: false, error: { code: "ERROR_CODE", message: "..." } }
```

### Error Codes

- `VALIDATION_ERROR` - Invalid request parameters
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error

### Content Hashing

Articles are deduplicated using SHA-256 hash of `url + title`.

## Environment Variables

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql://...      # Supabase pooled connection
DIRECT_URL=postgresql://...        # Supabase direct connection
ANTHROPIC_API_KEY=sk-ant-...       # Claude API key
PORT=3001
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:3001/api
```

## Development Guidelines

1. **TypeScript**: Use strict types, avoid `any`
2. **Validation**: Use Zod schemas for all API inputs
3. **Error Handling**: Always return consistent error format
4. **Testing**: Write tests for services and controllers
5. **Commits**: Use conventional commit messages

## RSS Sources (MVP)

- TechCrunch AI
- VentureBeat AI
- MIT Technology Review
- The Verge AI
- Ars Technica
- Wired AI

## Implementation Status

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for detailed task tracking.

### Current Phase: Phase 1 (Setup)

- [x] Project initialization
- [ ] Supabase database setup
- [ ] Backend project setup
- [ ] Frontend project setup
- [ ] Database schema and seeding

## Documentation

- [README.md](README.md) - Project overview
- [PRODUCT_SPECS.md](PRODUCT_SPECS.md) - User workflows and features
- [TECHNICAL_REQUIREMENTS.md](TECHNICAL_REQUIREMENTS.md) - Architecture details
- [PROJECT_PLAN.md](PROJECT_PLAN.md) - Goals and roadmap
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) - Step-by-step tasks
