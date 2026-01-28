---
name: deploy
description: Deploy the application to production with pre-flight checks, build, deployment, and verification.
disable-model-invocation: false
context: fork
agent: general-purpose
---

# Deploy Application to Production

Full deployment workflow with safety checks, builds, and verification per TECHNICAL_REQUIREMENTS.md.

## Architecture Overview

Per TECHNICAL_REQUIREMENTS.md, the deployment architecture:

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

## Pre-Deployment Checklist

### 1. Code Quality Gates

Run all quality checks before deployment:

```bash
cd /Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker

echo "============================================"
echo "Running Pre-Deployment Checks"
echo "============================================"

# Backend checks
echo ""
echo "📦 Backend Checks"
echo "--------------------------------------------"
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
fi

# TypeScript compilation
echo "  ✓ TypeScript compilation..."
npm run build
if [ $? -ne 0 ]; then
  echo "  ✗ Backend TypeScript compilation failed"
  exit 1
fi

# Linting (if configured)
if npm run lint --if-present 2>/dev/null; then
  echo "  ✓ Linting passed"
else
  echo "  ⚠ Linting not configured or failed"
fi

# Tests
echo "  ✓ Running tests..."
npm test
if [ $? -ne 0 ]; then
  echo "  ✗ Backend tests failed"
  exit 1
fi

echo "  ✓ Backend checks passed"

# Frontend checks
echo ""
echo "🎨 Frontend Checks"
echo "--------------------------------------------"
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

# TypeScript compilation & build
echo "  ✓ Building frontend..."
npm run build
if [ $? -ne 0 ]; then
  echo "  ✗ Frontend build failed"
  exit 1
fi

# Linting (if configured)
if npm run lint --if-present 2>/dev/null; then
  echo "  ✓ Linting passed"
else
  echo "  ⚠ Linting not configured or failed"
fi

echo "  ✓ Frontend checks passed"

echo ""
echo "============================================"
echo "✅ All pre-deployment checks passed!"
echo "============================================"
```

### 2. Environment Variables Check

Per TECHNICAL_REQUIREMENTS.md, verify all required environment variables:

```bash
echo ""
echo "🔑 Environment Variables Check"
echo "--------------------------------------------"

cd /Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker

# Check backend .env
if [ ! -f "backend/.env" ]; then
  echo "  ✗ Backend .env file missing"
  echo "    Run: cp backend/.env.example backend/.env"
  exit 1
fi

# Required backend variables (per TECHNICAL_REQUIREMENTS.md)
echo "  Checking backend environment variables..."
backend_required_vars=(
  "DATABASE_URL"
  "ANTHROPIC_API_KEY"
)

for var in "${backend_required_vars[@]}"; do
  if grep -q "^$var=" backend/.env && ! grep -q "^$var=$" backend/.env; then
    echo "    ✓ $var is set"
  else
    echo "    ✗ Missing or empty: $var"
    exit 1
  fi
done

# Optional backend variables
backend_optional_vars=(
  "DIRECT_URL"        # For Prisma migrations
  "PORT"
  "NODE_ENV"
  "YOUTUBE_API_KEY"   # V1: YouTube scraper
  "CRON_SECRET"       # V1: Vercel Cron auth
)

echo ""
echo "  Optional variables:"
for var in "${backend_optional_vars[@]}"; do
  if grep -q "^$var=" backend/.env && ! grep -q "^$var=$" backend/.env; then
    echo "    ✓ $var is set"
  else
    echo "    ○ $var not set (optional)"
  fi
done

# Check frontend .env
if [ ! -f "frontend/.env" ]; then
  echo ""
  echo "  ⚠ Frontend .env file missing (will use defaults)"
else
  echo ""
  echo "  Checking frontend environment variables..."
  if grep -q "^VITE_API_URL=" frontend/.env; then
    echo "    ✓ VITE_API_URL is set"
  else
    echo "    ⚠ VITE_API_URL not set (will use default)"
  fi
fi

echo ""
echo "  ✓ Environment variables check passed"
```

### 3. Database Connection Check

Per TECHNICAL_REQUIREMENTS.md, Supabase uses connection pooling:

```bash
echo ""
echo "🗄️  Database Connection Check"
echo "--------------------------------------------"

cd /Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker/backend

# Verify Prisma client is generated
echo "  Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
  echo "  ✗ Prisma client generation failed"
  exit 1
fi

# Check database connection
echo "  Testing database connection..."
npx prisma db execute --stdin <<< "SELECT 1 as connected;" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "  ✓ Database connection successful"
else
  echo "  ✗ Database connection failed"
  echo ""
  echo "  Troubleshooting:"
  echo "    1. Check DATABASE_URL format"
  echo "    2. Verify Supabase project is running"
  echo "    3. Check IP allowlist in Supabase dashboard"
  exit 1
fi

# Check for pending migrations
echo "  Checking migration status..."
npx prisma migrate status 2>&1
```

---

## Supabase Database Configuration

Per TECHNICAL_REQUIREMENTS.md, Supabase uses connection pooling with different ports:

### Connection String Format

```
# For application (connection pooling - port 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# For migrations (direct connection - port 5432)
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Prisma Configuration

Per TECHNICAL_REQUIREMENTS.md, update `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // For migrations
}
```

### Apply Migrations to Production

```bash
cd /Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker/backend

echo "🔄 Applying Database Migrations"
echo "--------------------------------------------"

# Deploy migrations (uses DIRECT_URL for migrations)
echo "  Deploying migrations..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
  echo "  ✗ Migration deployment failed"
  exit 1
fi

echo "  ✓ Migrations applied successfully"

# Seed database if needed (first deployment)
read -p "  Run database seed? (y/N): " run_seed
if [[ $run_seed =~ ^[Yy]$ ]]; then
  echo "  Seeding database..."
  npx prisma db seed
  if [ $? -eq 0 ]; then
    echo "  ✓ Database seeded"
  else
    echo "  ⚠ Seed failed (may already have data)"
  fi
fi
```

---

## Deployment: Vercel + Supabase (Recommended)

Per TECHNICAL_REQUIREMENTS.md, this is the recommended deployment setup.

### Backend Deployment

**Step 1: Create Vercel Configuration**

Create `backend/vercel.json`:

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
  ],
  "crons": [
    {
      "path": "/api/cron/refresh",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

> **Note:** The `crons` configuration is for V1. Remove it for MVP deployment.

**Step 2: Deploy Backend**

```bash
cd /Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker/backend

echo "🚀 Deploying Backend to Vercel"
echo "--------------------------------------------"

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
  echo "  Installing Vercel CLI..."
  npm install -g vercel
fi

# Login to Vercel (if not logged in)
vercel whoami 2>/dev/null || vercel login

# Set environment variables in Vercel
echo ""
echo "  Setting environment variables..."
echo "  (You may be prompted to configure these in the Vercel dashboard)"
echo ""
echo "  Required variables:"
echo "    - DATABASE_URL"
echo "    - ANTHROPIC_API_KEY"
echo ""
echo "  Optional variables (V1):"
echo "    - YOUTUBE_API_KEY"
echo "    - CRON_SECRET"
echo ""

# Deploy to production
echo "  Deploying..."
vercel --prod

if [ $? -ne 0 ]; then
  echo "  ✗ Backend deployment failed"
  exit 1
fi

# Get deployment URL
BACKEND_URL=$(vercel ls --json 2>/dev/null | jq -r '.[0].url' 2>/dev/null)
echo ""
echo "  ✓ Backend deployed successfully"
echo "  URL: https://$BACKEND_URL"
```

**Step 3: Configure Environment Variables in Vercel Dashboard**

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[password]@...` | Production |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Production |
| `NODE_ENV` | `production` | Production |
| `CRON_SECRET` | `your-secret-here` | Production (V1) |

### Frontend Deployment

**Step 1: Create Vercel Configuration (Optional)**

Vercel auto-detects Vite projects, but you can create `frontend/vercel.json`:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

**Step 2: Deploy Frontend**

```bash
cd /Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker/frontend

echo "🚀 Deploying Frontend to Vercel"
echo "--------------------------------------------"

# Set API URL for production
echo "  Configure VITE_API_URL to point to your backend:"
echo "  Example: https://your-backend.vercel.app/api"
echo ""

# Deploy to production
echo "  Deploying..."
vercel --prod

if [ $? -ne 0 ]; then
  echo "  ✗ Frontend deployment failed"
  exit 1
fi

# Get deployment URL
FRONTEND_URL=$(vercel ls --json 2>/dev/null | jq -r '.[0].url' 2>/dev/null)
echo ""
echo "  ✓ Frontend deployed successfully"
echo "  URL: https://$FRONTEND_URL"
```

**Step 3: Configure Environment Variables in Vercel Dashboard**

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` | Production |

---

## Post-Deployment Verification

### 1. Health Checks

```bash
echo ""
echo "🏥 Post-Deployment Health Checks"
echo "============================================"

# Set your deployment URLs
BACKEND_URL="${BACKEND_URL:-https://your-backend.vercel.app}"
FRONTEND_URL="${FRONTEND_URL:-https://your-frontend.vercel.app}"

# Wait for deployment to propagate
echo "  Waiting for deployment to propagate..."
sleep 10

# Check frontend
echo ""
echo "  🎨 Frontend Check"
echo "  ------------------------------------------"
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$frontend_status" -eq 200 ]; then
  echo "    ✓ Frontend is accessible (HTTP $frontend_status)"
else
  echo "    ✗ Frontend check failed (HTTP $frontend_status)"
fi
```

### 2. API Endpoint Verification

Per TECHNICAL_REQUIREMENTS.md, verify response format `{ success: true, data: [...] }`:

```bash
echo ""
echo "  📡 API Endpoint Checks"
echo "  ------------------------------------------"

# Test GET /api/sources (MVP)
echo "    Testing GET /api/sources..."
sources_response=$(curl -s "$BACKEND_URL/api/sources")
sources_success=$(echo "$sources_response" | jq -r '.success' 2>/dev/null)

if [ "$sources_success" = "true" ]; then
  sources_count=$(echo "$sources_response" | jq -r '.data | length' 2>/dev/null)
  echo "    ✓ GET /api/sources - $sources_count sources found"
else
  echo "    ✗ GET /api/sources failed"
  echo "      Response: $sources_response"
fi

# Test GET /api/articles (MVP)
echo "    Testing GET /api/articles..."
articles_response=$(curl -s "$BACKEND_URL/api/articles?limit=5")
articles_success=$(echo "$articles_response" | jq -r '.success' 2>/dev/null)

if [ "$articles_success" = "true" ]; then
  articles_count=$(echo "$articles_response" | jq -r '.data | length' 2>/dev/null)
  has_pagination=$(echo "$articles_response" | jq -r '.pagination.total' 2>/dev/null)
  echo "    ✓ GET /api/articles - $articles_count articles (total: $has_pagination)"
else
  echo "    ✗ GET /api/articles failed"
  echo "      Response: $articles_response"
fi

# Test GET /api/refresh/status (MVP)
echo "    Testing GET /api/refresh/status..."
refresh_response=$(curl -s "$BACKEND_URL/api/refresh/status")
refresh_success=$(echo "$refresh_response" | jq -r '.success' 2>/dev/null)

if [ "$refresh_success" = "true" ]; then
  echo "    ✓ GET /api/refresh/status - OK"
else
  echo "    ⚠ GET /api/refresh/status - No fetch history yet"
fi
```

### 3. Manual Refresh Test

```bash
echo ""
echo "  🔄 Manual Refresh Test"
echo "  ------------------------------------------"

echo "    Triggering manual refresh..."
refresh_trigger=$(curl -s -X POST "$BACKEND_URL/api/refresh")
trigger_success=$(echo "$refresh_trigger" | jq -r '.success' 2>/dev/null)

if [ "$trigger_success" = "true" ]; then
  echo "    ✓ Manual refresh triggered successfully"
else
  echo "    ⚠ Manual refresh may take time or failed"
  echo "      Response: $refresh_trigger"
fi
```

### 4. V1: Cron Job Verification

If deploying V1 with automated refresh:

```bash
echo ""
echo "  ⏰ V1: Cron Job Verification"
echo "  ------------------------------------------"

# Check if cron is configured
if [ -f "backend/vercel.json" ]; then
  has_cron=$(cat backend/vercel.json | jq -r '.crons | length' 2>/dev/null)
  if [ "$has_cron" -gt 0 ]; then
    echo "    ✓ Cron jobs configured in vercel.json"
    echo ""
    echo "    Configured cron jobs:"
    cat backend/vercel.json | jq -r '.crons[] | "      - \(.path) at \(.schedule)"' 2>/dev/null
    echo ""
    echo "    To verify cron is working:"
    echo "      1. Check Vercel dashboard → Functions → Cron"
    echo "      2. Wait for next scheduled run"
    echo "      3. Check /api/refresh/status for new fetch records"
  else
    echo "    ○ No cron jobs configured (MVP mode)"
  fi
else
  echo "    ○ vercel.json not found (MVP mode)"
fi
```

### 5. Database Verification

```bash
echo ""
echo "  🗄️  Database Verification"
echo "  ------------------------------------------"

cd /Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker/backend

# Check article count
echo "    Checking database records..."
article_count=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM articles;" 2>/dev/null | grep -o '[0-9]*' | head -1)
source_count=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM sources;" 2>/dev/null | grep -o '[0-9]*' | head -1)

echo "    ✓ Sources in database: ${source_count:-0}"
echo "    ✓ Articles in database: ${article_count:-0}"
```

---

## Rollback Procedures

### Vercel Rollback

```bash
echo "🔙 Rollback Procedure"
echo "============================================"

# List recent deployments
echo "  Recent deployments:"
vercel ls

echo ""
echo "  To rollback to previous deployment:"
echo ""
echo "  Option 1: Instant Rollback (recommended)"
echo "    vercel rollback"
echo ""
echo "  Option 2: Promote specific deployment"
echo "    vercel promote [deployment-url]"
echo ""
echo "  Option 3: Via Vercel Dashboard"
echo "    1. Go to project → Deployments"
echo "    2. Find previous working deployment"
echo "    3. Click '...' → 'Promote to Production'"
```

### Database Rollback

```bash
echo ""
echo "  🗄️  Database Rollback"
echo "  ------------------------------------------"
echo ""
echo "  If migration caused issues:"
echo ""
echo "  Option 1: Supabase Point-in-Time Recovery"
echo "    1. Go to Supabase Dashboard"
echo "    2. Navigate to Database → Backups"
echo "    3. Select point-in-time restore"
echo ""
echo "  Option 2: Manual Migration Rollback"
echo "    # Revert last migration (if supported)"
echo "    npx prisma migrate resolve --rolled-back <migration-name>"
echo ""
echo "  Option 3: Restore from backup"
echo "    psql \$DATABASE_URL < backup.sql"
```

---

## Monitoring & Alerts

### Vercel Monitoring

```bash
echo ""
echo "📊 Monitoring Setup"
echo "============================================"

echo "  1. Vercel Analytics (Built-in)"
echo "     - Go to project → Analytics"
echo "     - Enable Web Vitals tracking"
echo ""
echo "  2. Vercel Logs"
echo "     - Real-time: vercel logs --follow"
echo "     - Dashboard: Project → Functions → Logs"
echo ""
echo "  3. Function Monitoring"
echo "     - Project → Functions"
echo "     - View invocations, duration, errors"
```

### Recommended Alerts

Per TECHNICAL_REQUIREMENTS.md error handling patterns:

| Alert | Threshold | Action |
|-------|-----------|--------|
| API Error Rate | > 1% | Investigate logs |
| Response Time | > 2s p95 | Check database queries |
| Function Timeout | Any | Optimize or increase limit |
| Database Connection | Failures | Check Supabase status |
| Scraper Failures | > 50% | Check source availability |

### Optional: Error Tracking (Sentry)

```bash
# Install Sentry (optional)
cd backend
npm install @sentry/node

# Add to backend/src/app.ts
# import * as Sentry from '@sentry/node';
# Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

## Environment Variables Reference

### Backend (Production)

Per TECHNICAL_REQUIREMENTS.md:

```env
# ===========================================
# Database (Supabase) - REQUIRED
# ===========================================
# Application connection (pooled - port 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migration connection (direct - port 5432)
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# ===========================================
# AI (Anthropic) - REQUIRED
# ===========================================
ANTHROPIC_API_KEY=sk-ant-...

# ===========================================
# Server - OPTIONAL (defaults provided)
# ===========================================
NODE_ENV=production
PORT=3001

# ===========================================
# V1: YouTube Scraper - OPTIONAL
# ===========================================
YOUTUBE_API_KEY=AIza...

# ===========================================
# V1: Cron Authentication - REQUIRED for V1
# ===========================================
CRON_SECRET=your-random-secret-here
```

### Frontend (Production)

```env
# API URL pointing to backend
VITE_API_URL=https://your-backend.vercel.app/api
```

---

## Troubleshooting

### Deployment Fails

| Issue | Solution |
|-------|----------|
| TypeScript errors | Run `npm run build` locally first |
| Missing dependencies | Check `package.json`, run `npm install` |
| Environment variables | Verify all required vars in Vercel dashboard |
| Build timeout | Increase build timeout in Vercel settings |

### API Errors

| Issue | Solution |
|-------|----------|
| 500 Internal Error | Check Vercel function logs |
| Database connection | Verify DATABASE_URL, check Supabase status |
| CORS errors | Verify frontend URL in CORS config |
| 401 on cron | Check CRON_SECRET matches |

### Database Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Check IP allowlist in Supabase |
| Too many connections | Use connection pooling (port 6543) |
| Migration failed | Use DIRECT_URL (port 5432) for migrations |
| Timeout | Check Supabase region, consider pgbouncer |

### Frontend Issues

| Issue | Solution |
|-------|----------|
| API calls failing | Check VITE_API_URL is correct |
| Build fails | Clear cache: `rm -rf node_modules/.vite` |
| Blank page | Check browser console for errors |
| Stale data | Clear TanStack Query cache |

---

## Deployment Checklist Summary

### Pre-Deployment
- [ ] All tests passing (`npm test`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Code reviewed and approved

### Deployment
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in Vercel dashboard
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Database seeded (if first deployment)

### Post-Deployment
- [ ] Frontend loads correctly
- [ ] API endpoints return `{ success: true, data: [...] }`
- [ ] GET /api/sources returns sources
- [ ] GET /api/articles returns paginated articles
- [ ] POST /api/refresh triggers scraping
- [ ] Database has data
- [ ] No errors in Vercel logs
- [ ] (V1) Cron jobs configured and verified

### V1 Specific
- [ ] CRON_SECRET set in environment
- [ ] `crons` configured in vercel.json
- [ ] Cron endpoint returns 401 without auth
- [ ] Cron endpoint works with proper auth header

---

## Quick Deploy Commands

```bash
# Full deployment (backend + frontend)
cd /Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker

# Backend
cd backend && npm run build && npm test && vercel --prod

# Frontend
cd ../frontend && npm run build && vercel --prod

# Verify
curl https://your-backend.vercel.app/api/sources
curl https://your-frontend.vercel.app
```

---

## Deployment Complete!

Your AI Trends Tracker is now live in production.

**Production URLs:**
- Frontend: `https://your-frontend.vercel.app`
- Backend API: `https://your-backend.vercel.app/api`

**Next Steps:**
1. Monitor Vercel logs for the first hour
2. Verify scrapers work via manual refresh
3. (V1) Wait for first cron execution
4. Test from different devices/browsers
5. Set up custom domain (optional)
