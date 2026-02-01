---
name: commit
description: Stage changes, create a commit with a descriptive message, and optionally push to GitHub.
argument-hint: [optional commit message or description of changes]
---

# Commit Changes: $ARGUMENTS

Create a git commit for the current changes and optionally push to GitHub.

## Workflow

### 1. Check Current State

First, analyze the current git state:

```bash
cd /Users/abdelmoneimnafea/Documents/Personal/Projects/ai-trends-tracker

# Show current branch
echo "Current branch:"
git branch --show-current

# Show status (staged and unstaged changes)
echo ""
echo "Git status:"
git status --short

# Show diff summary
echo ""
echo "Changes summary:"
git diff --stat
git diff --cached --stat
```

### 2. Review Changes

Before committing, review what will be included:

```bash
# Show unstaged changes
git diff

# Show staged changes
git diff --cached

# Show recent commits for context
echo ""
echo "Recent commits:"
git log --oneline -5
```

### 3. Stage Changes

Stage the appropriate files:

```bash
# Option A: Stage specific files (preferred)
git add <file1> <file2> ...

# Option B: Stage all changes (use with caution)
git add -A

# Verify what's staged
git status
```

**Guidelines:**
- Prefer staging specific files over `git add -A`
- Never stage sensitive files (.env, credentials, API keys)
- Review staged changes before committing

### 4. Create Commit

Create a well-formatted commit message:

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <short description>

<optional body with more details>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Commit Message Format:**

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

**Examples:**
```bash
# Feature
git commit -m "feat(api): add article search endpoint"

# Bug fix
git commit -m "fix(scraper): handle rate limiting correctly"

# Documentation
git commit -m "docs: update README with setup instructions"

# Refactoring
git commit -m "refactor(backend): restructure to flat directory layout"

# Chore
git commit -m "chore: clean up unused files and dependencies"
```

### 5. Push to GitHub

Push the commit to the remote repository:

```bash
# Push to current branch
git push

# If branch doesn't exist on remote yet
git push -u origin $(git branch --show-current)

# Verify push succeeded
git log --oneline -1
echo "Pushed to: $(git remote get-url origin)"
```

---

## Safety Checklist

Before committing, verify:

- [ ] No sensitive data (API keys, passwords, .env files)
- [ ] No large binary files
- [ ] No node_modules or build artifacts
- [ ] Changes are related and form a logical unit
- [ ] Commit message accurately describes the changes

**Files to NEVER commit:**
- `.env` (use `.env.example` instead)
- `node_modules/`
- `dist/` or `build/`
- `.DS_Store`
- Credentials or API keys

---

## Common Scenarios

### Commit All Changes
```bash
git add -A
git status  # Review what's staged
git commit -m "$(cat <<'EOF'
<type>: <description>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
git push
```

### Commit Specific Files
```bash
git add backend/src/services/scraper.service.ts
git add backend/tests/services/scraper.test.ts
git commit -m "$(cat <<'EOF'
feat(scraper): implement RSS feed scraper

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
git push
```

### Amend Last Commit (if not pushed yet)
```bash
git add <additional-files>
git commit --amend --no-edit
# Or with new message:
git commit --amend -m "new message"
```

### Create Branch and Commit
```bash
git checkout -b feature/new-feature
git add -A
git commit -m "feat: implement new feature"
git push -u origin feature/new-feature
```

---

## Handling Issues

### Pre-commit Hook Fails
```bash
# Fix the issues first, then:
git add <fixed-files>
git commit -m "message"

# Or skip hooks (not recommended):
git commit --no-verify -m "message"
```

### Merge Conflicts
```bash
# After resolving conflicts:
git add <resolved-files>
git commit -m "merge: resolve conflicts with main"
git push
```

### Wrong Branch
```bash
# If you haven't committed yet:
git stash
git checkout correct-branch
git stash pop

# If you already committed:
git log --oneline -1  # Note the commit hash
git checkout correct-branch
git cherry-pick <commit-hash>
```

---

## Output

After successful commit and push, report:

1. **Commit hash** - The short SHA of the new commit
2. **Branch** - Which branch was updated
3. **Files changed** - Summary of changes
4. **Remote URL** - Link to view on GitHub

Example output:
```
Committed and pushed successfully!

Commit: abc1234
Branch: main
Files: 5 files changed, 120 insertions(+), 45 deletions(-)
Remote: https://github.com/username/ai-trends-tracker
```
