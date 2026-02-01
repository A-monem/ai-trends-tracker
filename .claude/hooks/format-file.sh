#!/bin/bash

# Post-edit hook: Auto-format files with Prettier after Edit/Write
# Exit codes: 0 = success, 1 = warning (non-critical), 2 = error

# Read tool input from stdin
INPUT=$(cat)

# Extract file_path from the tool input JSON
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')

# If no file_path found, exit successfully (nothing to format)
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only format TypeScript/JavaScript files
if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx|json)$ ]]; then
  # Check if file exists
  if [ ! -f "$FILE_PATH" ]; then
    echo "⚠️  File not found: $FILE_PATH"
    exit 1
  fi

  echo "✨ Formatting $FILE_PATH with Prettier..."

  # Determine which Prettier to use (backend or frontend)
  PROJECT_DIR="/Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker"

  if [[ "$FILE_PATH" == *"backend"* ]]; then
    PRETTIER_DIR="$PROJECT_DIR/backend"
  elif [[ "$FILE_PATH" == *"frontend"* ]]; then
    PRETTIER_DIR="$PROJECT_DIR/frontend"
  else
    # Default to backend
    PRETTIER_DIR="$PROJECT_DIR/backend"
  fi

  # Check if node_modules exists
  if [ ! -d "$PRETTIER_DIR/node_modules" ]; then
    echo "⚠️  node_modules not found in $PRETTIER_DIR, skipping formatting"
    exit 1
  fi

  # Format with Prettier
  cd "$PRETTIER_DIR"

  if npx prettier --write "$FILE_PATH" 2>/dev/null; then
    echo "✅ File formatted successfully"
    exit 0
  else
    echo "⚠️  Prettier formatting failed (file may not be valid JavaScript/TypeScript)"
    exit 1  # Warning, not an error
  fi
else
  # Not a TypeScript/JavaScript file, skip formatting
  exit 0
fi
