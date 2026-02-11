# AI Trends Tracker

A full-stack web application that aggregates AI-related news from multiple sources and presents them with AI-powered summaries using Claude.

## Overview

AI Trends Tracker solves the problem of information overload by centralizing AI news from RSS feeds, YouTube, Reddit, and Hacker News into a single, digestible feed with intelligent summaries.

### Key Features

- **Content Aggregation** - Collects AI news from 6+ RSS feeds, YouTube channels, Reddit, and Hacker News
- **AI Summaries** - Uses Claude 3.5 Haiku to generate concise summaries of each article
- **Smart Deduplication** - Prevents duplicate content using SHA-256 content hashing
- **Source Filtering** - Filter articles by source or content type
- **Responsive UI** - Clean card-based layout that works on mobile and desktop

## Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Frontend   | React + Vite + TypeScript    |
| Styling    | Tailwind CSS                 |
| State      | TanStack Query               |
| Backend    | Node.js + Express.js         |
| Database   | PostgreSQL (Supabase)        |
| ORM        | Prisma                       |
| Validation | Zod                          |
| AI         | Claude 4.5 Haiku (Anthropic) |
| Deployment | Vercel + Supabase            |

## Project Structure

```
ai-trends-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── utils/           # Helper utilities
│   │   ├── routes/          # API route definitions
│   │   └── prisma/          # Database schema & seeds
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client
│   │   └── types/           # TypeScript definitions
│   └── tests/
├── .claude/                  # Claude Code configuration
│   ├── hooks/               # Automation hooks
│   └── skills/              # Custom skills
├── CLAUDE.md                # Claude Code context
├── PRODUCT_SPECS.md         # User workflows and features
├── TECHNICAL_REQUIREMENTS.md # Architecture details
├── PROJECT_PLAN.md          # Goals and roadmap
└── IMPLEMENTATION_PLAN.md   # Step-by-step tasks
```

## Getting Started

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- Supabase account (free tier)
- Anthropic API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd ai-trends-tracker
   ```

2. **Backend setup**

   ```bash
   cd backend
   npm install
   cp .env.example .env    # Add your credentials
   npm run db:generate     # Generate Prisma client
   npm run db:push         # Push schema to database
   npm run db:seed         # Seed RSS sources
   npm run dev             # Start on :3001
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env    # Configure API URL
   npm run dev             # Start on :5173
   ```

### Environment Variables

**Backend** (`backend/.env`):

```env
# Server
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# APIs
ANTHROPIC_API_KEY=sk-ant-...

# AI Processing
AI_MODEL=claude-haiku-4-5-20251001
AI_MAX_TOKENS=300
AI_BATCH_SIZE=10

# Logging
LOG_LEVEL=info
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:3001/api
```

## API Endpoints

| Method | Endpoint              | Description                         |
| ------ | --------------------- | ----------------------------------- |
| GET    | `/health`             | Health check                        |
| GET    | `/api/articles`       | List articles (paginated)           |
| GET    | `/api/articles/:id`   | Get single article                  |
| GET    | `/api/sources`        | List all sources                    |
| POST   | `/api/refresh`        | Trigger content refresh + summarize |
| GET    | `/api/refresh/status` | Get latest refresh status           |
| POST   | `/api/summarize`      | Summarize only (no refresh)         |

### Query Parameters

**GET /api/articles**

- `source` - Filter by source slug (e.g., `techcrunch-ai`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**POST /api/summarize**

- `limit` - Max articles to summarize (optional, max: 50)

## Content Sources

### MVP (RSS Feeds)

- TechCrunch AI
- VentureBeat AI
- MIT Technology Review
- The Verge AI
- Ars Technica
- Wired AI

### V1 (Planned)

- YouTube (Two Minute Papers, Andrej Karpathy, etc.)
- Hacker News (AI-filtered)
- Reddit (r/MachineLearning, r/artificial, r/LocalLLaMA)

## Development Roadmap

### MVP

- [x] Project setup (Phase 1)
- [x] Backend API - articles, sources, refresh (Phase 2)
- [x] RSS feed parsing and scraping
- [x] Claude AI summarization with retry logic
- [ ] Frontend UI with filtering (Phase 3)
- [ ] Deployment

### V1

- [ ] YouTube integration
- [ ] Hacker News integration
- [ ] Reddit integration
- [ ] Automated cron jobs (6-hour refresh)

### V2

- [ ] Full-text search
- [ ] Advanced filtering (category, date range)
- [ ] AI-powered content categorization
- [ ] Dark mode
- [ ] Bookmarks with export
- [ ] User accounts

## Scripts

### Backend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
```

## Documentation

- [Product Specs](PRODUCT_SPECS.md) - User workflows and features
- [Technical Requirements](TECHNICAL_REQUIREMENTS.md) - Architecture and implementation details
- [Project Plan](PROJECT_PLAN.md) - Goals and feature roadmap
- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Step-by-step development guide

## License

MIT

---

Built with Claude Code
