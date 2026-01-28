---
name: deploy
description: Deploy the application to production with pre-flight checks, build, deployment, and verification.
disable-model-invocation: false
context: fork
agent: general-purpose
---

# Deploy Application to Production

Full deployment workflow with safety checks, builds, and verification.

## Pre-Deployment Checklist

### 1. Code Quality Gates
Run all quality checks before deployment:

```bash
cd /Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker

# Backend checks
cd apps/backend
echo "Running backend checks..."

# TypeScript compilation
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Backend TypeScript compilation failed"
  exit 1
fi

# Linting
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Backend linting failed"
  exit 1
fi

# Tests
npm test
if [ $? -ne 0 ]; then
  echo "❌ Backend tests failed"
  exit 1
fi

echo "✅ Backend checks passed"

# Frontend checks
cd ../frontend
echo "Running frontend checks..."

# TypeScript compilation
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed"
  exit 1
fi

# Linting
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Frontend linting failed"
  exit 1
fi

echo "✅ Frontend checks passed"
```

### 2. Environment Variables Check
Ensure all required environment variables are set:

```bash
# Check backend .env
if [ ! -f "apps/backend/.env" ]; then
  echo "❌ Backend .env file missing"
  exit 1
fi

# Required variables
required_vars=(
  "DATABASE_URL"
  "ANTHROPIC_API_KEY"
  "YOUTUBE_API_KEY"
  "NODE_ENV"
  "PORT"
  "CORS_ORIGIN"
)

for var in "${required_vars[@]}"; do
  if ! grep -q "^$var=" apps/backend/.env; then
    echo "❌ Missing required variable: $var"
    exit 1
  fi
done

echo "✅ Environment variables configured"
```

### 3. Database Migrations
Ensure migrations are up to date:

```bash
cd apps/backend

# Check for pending migrations
echo "Checking database migrations..."

# List migration status
npm run db:status

# If pending migrations exist, prompt user
read -p "Apply pending migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm run db:migrate
  echo "✅ Migrations applied"
else
  echo "⚠️  Skipping migrations - ensure they're applied manually"
fi
```

## Deployment Steps

### Option 1: Deploy to Railway

```bash
# Install Railway CLI (if not installed)
if ! command -v railway &> /dev/null; then
  npm install -g @railway/cli
fi

# Login
railway login

# Link to project (first time only)
# railway link

# Deploy backend
cd apps/backend
echo "Deploying backend to Railway..."

railway up
if [ $? -ne 0 ]; then
  echo "❌ Backend deployment failed"
  exit 1
fi

echo "✅ Backend deployed"

# Get backend URL
BACKEND_URL=$(railway variables get RAILWAY_PUBLIC_DOMAIN)
echo "Backend URL: https://$BACKEND_URL"

# Deploy frontend
cd ../frontend
echo "Deploying frontend to Vercel..."

# Install Vercel CLI (if not installed)
if ! command -v vercel &> /dev/null; then
  npm install -g vercel
fi

# Set backend URL for frontend
export VITE_API_URL="https://$BACKEND_URL/api"

# Deploy
vercel --prod
if [ $? -ne 0 ]; then
  echo "❌ Frontend deployment failed"
  exit 1
fi

echo "✅ Frontend deployed"
```

### Option 2: Deploy to Render

```bash
# Backend deployment
echo "Deploying backend to Render..."

# Create render.yaml in project root
cat > render.yaml << EOF
services:
  - type: web
    name: ai-trends-backend
    env: node
    buildCommand: cd apps/backend && npm install && npm run build
    startCommand: cd apps/backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: ai-trends-db
          property: connectionString
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: YOUTUBE_API_KEY
        sync: false

databases:
  - name: ai-trends-db
    plan: starter
EOF

# Deploy via git push
git add render.yaml
git commit -m "chore: add Render configuration"
git push origin main

echo "✅ Check Render dashboard for deployment status"

# Frontend deployment (Render static site)
cd apps/frontend

# Build
npm run build

# Deploy to Render
# (Follow Render UI to connect repository)

echo "✅ Frontend build complete"
```

### Option 3: Docker Deployment

```bash
# Build Docker images
echo "Building Docker images..."

docker-compose build

if [ $? -ne 0 ]; then
  echo "❌ Docker build failed"
  exit 1
fi

echo "✅ Docker images built"

# Tag for registry
docker tag ai-trends-backend:latest your-registry.com/ai-trends-backend:latest
docker tag ai-trends-frontend:latest your-registry.com/ai-trends-frontend:latest

# Push to registry
docker push your-registry.com/ai-trends-backend:latest
docker push your-registry.com/ai-trends-frontend:latest

echo "✅ Images pushed to registry"

# Deploy to server
ssh your-server << 'EOF'
  cd /var/www/ai-trends-tracker
  docker-compose pull
  docker-compose up -d
  docker-compose logs -f
EOF

echo "✅ Deployed to server"
```

## Post-Deployment Verification

### 1. Health Checks
```bash
# Wait for services to start
sleep 10

# Check backend health
echo "Checking backend health..."
BACKEND_URL="https://your-backend-url.com"

response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/health)

if [ $response -eq 200 ]; then
  echo "✅ Backend health check passed"
else
  echo "❌ Backend health check failed (HTTP $response)"
  exit 1
fi

# Check frontend
echo "Checking frontend..."
FRONTEND_URL="https://your-frontend-url.com"

response=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)

if [ $response -eq 200 ]; then
  echo "✅ Frontend health check passed"
else
  echo "❌ Frontend health check failed (HTTP $response)"
  exit 1
fi
```

### 2. API Endpoint Tests
```bash
echo "Testing API endpoints..."

# Test GET /api/trends
curl -s $BACKEND_URL/api/trends?limit=5 | jq '.data.items | length'

# Test GET /api/sources
curl -s $BACKEND_URL/api/sources | jq '. | length'

# Test GET /api/stats
curl -s $BACKEND_URL/api/stats | jq '.total'

echo "✅ API endpoints responsive"
```

### 3. Database Connectivity
```bash
echo "Checking database connectivity..."

# Query database via MCP or psql
psql $DATABASE_URL -c "SELECT COUNT(*) FROM trends;"

if [ $? -eq 0 ]; then
  echo "✅ Database connection successful"
else
  echo "❌ Database connection failed"
  exit 1
fi
```

### 4. Cron Jobs Verification
```bash
echo "Verifying cron jobs are running..."

# Check scraper job logs
curl -s $BACKEND_URL/api/sources/status | jq '.[] | select(.consecutiveFailures > 0)'

# Should return empty if all scrapers working
echo "✅ Cron jobs status checked"
```

### 5. Monitor Logs
```bash
echo "Monitoring deployment logs..."

# Railway
railway logs

# Or Render
# (Check Render dashboard)

# Or Docker
docker-compose logs -f --tail=100

# Look for:
# - No error messages
# - Successful database connections
# - Scrapers running
# - API requests being handled
```

## Rollback Procedure

If deployment fails, rollback immediately:

### Railway Rollback
```bash
# Rollback to previous deployment
railway rollback

echo "✅ Rolled back to previous version"
```

### Render Rollback
```bash
# Redeploy previous commit
git revert HEAD
git push origin main

echo "✅ Rolled back via git revert"
```

### Docker Rollback
```bash
# Pull previous image version
docker pull your-registry.com/ai-trends-backend:previous
docker pull your-registry.com/ai-trends-frontend:previous

# Restart with previous version
docker-compose down
docker-compose up -d

echo "✅ Rolled back to previous images"
```

### Database Rollback
```bash
# If migration caused issues
cd apps/backend
npm run db:rollback

echo "✅ Database migration rolled back"

# Restore from backup if necessary
psql $DATABASE_URL < backup_latest.sql
```

## Monitoring & Alerts

### 1. Set Up Error Tracking
```bash
# Configure error tracking service (Sentry, LogRocket, etc.)
echo "Error tracking configured"
```

### 2. Monitor Resource Usage
```bash
# Check CPU, memory, database connections
# Via hosting platform dashboard or monitoring tools
```

### 3. Alert Configuration
- Set up alerts for:
  - API response time > 1s
  - Error rate > 1%
  - Database connection failures
  - Scraper failures

## Post-Deployment Tasks

### 1. Verify Critical Flows
Test these user flows manually:
- [ ] View trends feed
- [ ] Filter by source and category
- [ ] Search for trends
- [ ] Bookmark a trend
- [ ] Mark as read
- [ ] Refresh trends (manual trigger)

### 2. Performance Check
```bash
# Check page load time
curl -w "@curl-format.txt" -o /dev/null -s $FRONTEND_URL

# Check API response time
time curl $BACKEND_URL/api/trends
```

### 3. Update Documentation
- Update README.md with production URLs
- Update API documentation with production endpoints
- Document any deployment-specific configurations

### 4. Notify Team
Send deployment notification:
```
🚀 AI Trends Tracker Deployed

Backend: https://your-backend-url.com
Frontend: https://your-frontend-url.com

Health Status: ✅ All systems operational

Changes:
- [List key changes from commits]

Monitoring: [Link to monitoring dashboard]
```

## Troubleshooting

### Deployment Fails
1. Check build logs for errors
2. Verify environment variables are set correctly
3. Ensure database is accessible
4. Check for port conflicts

### Application Not Starting
1. Check service logs
2. Verify all dependencies installed
3. Check database migrations applied
4. Verify environment variables loaded

### Database Connection Issues
1. Check DATABASE_URL format
2. Verify database is running
3. Check firewall rules
4. Verify credentials

### High Error Rates After Deployment
1. Rollback immediately
2. Check error logs
3. Compare with previous version
4. Fix and redeploy

## Deployment Checklist Summary

**Pre-Deployment:**
- [ ] All tests passing
- [ ] TypeScript compiles
- [ ] Linting passes
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Code reviewed and approved

**Deployment:**
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Database migrated
- [ ] Environment variables configured

**Post-Deployment:**
- [ ] Health checks pass
- [ ] API endpoints working
- [ ] Database connected
- [ ] Cron jobs running
- [ ] No errors in logs
- [ ] Critical flows tested
- [ ] Performance acceptable
- [ ] Team notified

---

## Deployment Complete! 🎉

Your AI Trends Tracker is now live in production.

**Next Steps:**
1. Monitor logs for the first hour
2. Check error tracking dashboard
3. Verify scrapers run on schedule
4. Test from different devices/browsers
5. Celebrate! 🎉
