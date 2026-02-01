#!/bin/bash

# Session start hook: Load test status into conversation context
# Exit code: Always 0 (informational only, never block)

PROJECT_DIR="/Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker"

echo "📊 Loading Project Status..."
echo "============================================"

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
  echo "⚠️  Project directory not found: $PROJECT_DIR"
  exit 0
fi

cd "$PROJECT_DIR"

# Check Git status
echo ""
echo "📁 Git Status:"
echo "-------------"
if command -v git &> /dev/null; then
  BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  echo "Current branch: $BRANCH"

  # Count uncommitted changes
  MODIFIED=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
  if [ "$MODIFIED" -gt 0 ]; then
    echo "⚠️  $MODIFIED uncommitted changes"
  else
    echo "✅ Working directory clean"
  fi

  # Show last commit
  echo "Last commit: $(git log -1 --oneline 2>/dev/null || echo 'none')"
else
  echo "Git not available"
fi

# Backend status
if [ -d "backend" ]; then
  echo ""
  echo "📦 Backend Status:"
  echo "-----------------"

  cd backend

  # Check if dependencies are installed
  if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed (run: npm install)"
  else
    echo "✅ Dependencies installed"

    # Run quick test check (don't run full suite, just check if tests exist)
    if [ -d "src/__tests__" ] || [ -d "src/**/__tests__" ]; then
      echo "📝 Test files found"

      # Try to run tests (with timeout)
      echo "Running backend tests..."
      timeout 30s npm test --silent 2>&1 > /tmp/backend-test-output.txt
      TEST_EXIT_CODE=$?

      if [ $TEST_EXIT_CODE -eq 0 ]; then
        echo "✅ All backend tests passing"
      elif [ $TEST_EXIT_CODE -eq 124 ]; then
        echo "⏱️  Tests timed out (>30s) - run manually for full results"
      else
        echo "❌ Some backend tests failing:"
        grep -A 3 "FAIL" /tmp/backend-test-output.txt 2>/dev/null || echo "   (Run 'npm test' for details)"
      fi
    else
      echo "ℹ️  No test files found yet"
    fi
  fi

  cd "$PROJECT_DIR"
fi

# Frontend status
if [ -d "frontend" ]; then
  echo ""
  echo "🎨 Frontend Status:"
  echo "------------------"

  cd frontend

  # Check if dependencies are installed
  if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed (run: npm install)"
  else
    echo "✅ Dependencies installed"

    # Check if tests exist
    if [ -d "src/__tests__" ] || compgen -G "src/**/*.test.tsx" > /dev/null 2>&1; then
      echo "📝 Test files found"
    else
      echo "ℹ️  No test files found yet"
    fi
  fi

  cd "$PROJECT_DIR"
fi

# Database status
echo ""
echo "🗄️  Database Status:"
echo "------------------"

if [ -f "backend/.env" ]; then
  # Check if DATABASE_URL is set
  if grep -q "^DATABASE_URL=" backend/.env; then
    DATABASE_URL=$(grep "^DATABASE_URL=" backend/.env | cut -d'=' -f2-)

    # Check if it's PostgreSQL
    if [[ "$DATABASE_URL" == postgresql://* ]]; then
      echo "🐘 PostgreSQL configured"

      # Try to connect (quick check)
      if command -v psql &> /dev/null; then
        if psql "$DATABASE_URL" -c "SELECT 1;" &>/dev/null; then
          echo "✅ Database connection successful"

          # Check if tables exist
          TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
          if [ -n "$TABLE_COUNT" ] && [ "$TABLE_COUNT" -gt 0 ]; then
            echo "📊 $TABLE_COUNT tables in database"
          else
            echo "⚠️  No tables found (run migrations?)"
          fi
        else
          echo "⚠️  Cannot connect to database (check if PostgreSQL is running)"
        fi
      else
        echo "ℹ️  psql not installed (cannot verify connection)"
      fi
    elif [[ "$DATABASE_URL" == file:* ]]; then
      echo "📁 SQLite configured"
      DB_FILE=$(echo "$DATABASE_URL" | sed 's/file://')
      if [ -f "backend/$DB_FILE" ]; then
        echo "✅ Database file exists"
      else
        echo "⚠️  Database file not found (run migrations?)"
      fi
    fi
  else
    echo "⚠️  DATABASE_URL not set in .env"
  fi
else
  echo "⚠️  .env file not found in backend/"
fi

# API Keys status
echo ""
echo "🔑 API Keys Status:"
echo "------------------"

if [ -f "backend/.env" ]; then
  # Check for required API keys
  KEYS_FOUND=0
  KEYS_MISSING=0

  for key in "ANTHROPIC_API_KEY" "YOUTUBE_API_KEY"; do
    if grep -q "^$key=" backend/.env; then
      KEYS_FOUND=$((KEYS_FOUND + 1))
    else
      KEYS_MISSING=$((KEYS_MISSING + 1))
      echo "⚠️  $key not set"
    fi
  done

  if [ $KEYS_MISSING -eq 0 ]; then
    echo "✅ All required API keys configured"
  else
    echo "⚠️  $KEYS_MISSING API key(s) missing"
  fi
else
  echo "⚠️  .env file not found"
fi

# Project structure
echo ""
echo "📂 Project Structure:"
echo "--------------------"
if [ -d "backend" ]; then
  echo "✅ Backend exists"
fi
if [ -d "frontend" ]; then
  echo "✅ Frontend exists"
fi
if [ -d ".claude/skills" ]; then
  SKILL_COUNT=$(ls -1 .claude/skills 2>/dev/null | wc -l | tr -d ' ')
  echo "✅ $SKILL_COUNT custom skills installed"
fi
if [ -f ".claude/settings.json" ]; then
  echo "✅ Hooks configured"
fi
if [ -f "CLAUDE.md" ]; then
  echo "✅ Project documentation (CLAUDE.md) exists"
fi

echo ""
echo "============================================"
echo "✨ Status check complete!"
echo ""

# Always exit successfully (informational only)
exit 0
