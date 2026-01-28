#!/bin/bash

# Pre-commit hook: Run quality checks before allowing git commit
# Exit codes: 0 = success, 1 = warning (allow commit), 2 = block commit

set -e

PROJECT_DIR="/Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker"

echo "🔍 Running pre-commit quality checks..."
echo "============================================"

# Check if we're in the project directory
if [ ! -d "$PROJECT_DIR" ]; then
  echo "⚠️  Project directory not found: $PROJECT_DIR"
  exit 1
fi

cd "$PROJECT_DIR"

# Track if any checks failed
FAILED=0

# Backend checks
if [ -d "apps/backend" ]; then
  echo ""
  echo "📦 Backend Checks"
  echo "----------------"

  cd apps/backend

  # Check if node_modules exists
  if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found, skipping backend checks"
    cd "$PROJECT_DIR"
  else
    # TypeScript compilation check
    echo "Checking TypeScript compilation..."
    if npm run build --silent 2>&1 | grep -q "error"; then
      echo "❌ TypeScript compilation failed"
      FAILED=1
    else
      echo "✅ TypeScript OK"
    fi

    # Linting check
    echo "Running ESLint..."
    if npm run lint --silent 2>&1 | grep -q "error"; then
      echo "❌ Linting failed"
      FAILED=1
    else
      echo "✅ Linting passed"
    fi

    # Tests
    echo "Running tests..."
    if npm test --silent 2>&1; then
      echo "✅ Tests passed"
    else
      echo "❌ Tests failed"
      FAILED=1
    fi

    cd "$PROJECT_DIR"
  fi
fi

# Frontend checks
if [ -d "apps/frontend" ]; then
  echo ""
  echo "🎨 Frontend Checks"
  echo "-----------------"

  cd apps/frontend

  # Check if node_modules exists
  if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found, skipping frontend checks"
    cd "$PROJECT_DIR"
  else
    # TypeScript check
    echo "Checking TypeScript..."
    if npm run build --silent 2>&1 | grep -q "error"; then
      echo "❌ TypeScript compilation failed"
      FAILED=1
    else
      echo "✅ TypeScript OK"
    fi

    # Linting
    echo "Running ESLint..."
    if npm run lint --silent 2>&1 | grep -q "error"; then
      echo "❌ Linting failed"
      FAILED=1
    else
      echo "✅ Linting passed"
    fi

    cd "$PROJECT_DIR"
  fi
fi

echo ""
echo "============================================"

if [ $FAILED -eq 1 ]; then
  echo "❌ Pre-commit checks FAILED"
  echo ""
  echo "Fix the issues above before committing."
  echo "Or use 'git commit --no-verify' to skip checks (not recommended)."
  exit 2  # Exit code 2 blocks the commit
else
  echo "✅ All pre-commit checks passed!"
  echo ""
  exit 0  # Exit code 0 allows the commit
fi
