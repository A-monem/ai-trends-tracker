# AI Trends Tracker

Stay up-to-date with the latest AI news, research, and trends from multiple sources in one beautiful dashboard.

## Features

- 📰 **Aggregated News** - AI content from TechCrunch, VentureBeat, The Verge, MIT Tech Review
- 🎥 **YouTube Videos** - Latest AI videos from top creators and researchers
- 🤖 **AI-Powered Summaries** - Claude API generates concise summaries and key insights
- 🏷️ **Smart Categorization** - Automatically categorizes content (Research, Product Launch, Tutorial, etc.)
- 🔖 **Bookmarks & Collections** - Save and organize important articles
- 🔄 **Auto-Refresh** - Scheduled updates every 6 hours
- 🎨 **Modern UI** - Clean, responsive design with dark mode

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL for data storage
- Claude API for AI features
- RSS Parser for news feeds
- YouTube API for videos
- Node-cron for scheduled updates

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Query for data fetching
- Card-based responsive UI

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL
- YouTube API Key (free from Google Cloud Console)
- Anthropic API Key for Claude

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ai-trends-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start PostgreSQL (using Docker)
docker-compose up -d

# Run database migrations
npm run migrate

# Start development servers
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:4000`.

### Development

```bash
# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Run tests
npm run test

# Manually trigger content refresh
curl -X POST http://localhost:4000/api/trends/refresh
```

## Project Structure

```
ai-trends-tracker/
├── apps/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   │   ├── scrapers/ # RSS, YouTube, LinkedIn scrapers
│   │   │   ├── services/ # AI, trends, database services
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── jobs/     # Cron jobs
│   │   │   └── db/       # Database migrations
│   │   └── package.json
│   │
│   └── frontend/         # React application
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   └── hooks/
│       └── package.json
│
├── packages/
│   └── shared/           # Shared types
└── package.json
```

## API Endpoints

```
GET    /api/trends              - Get all trends (with filters)
GET    /api/trends/:id          - Get single trend
POST   /api/trends/refresh      - Manually trigger refresh
GET    /api/sources             - List all sources
GET    /api/categories          - List all categories
PATCH  /api/trends/:id/read     - Mark as read
POST   /api/trends/:id/bookmark - Toggle bookmark
```

## Deployment

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for deployment instructions.

## License

MIT
