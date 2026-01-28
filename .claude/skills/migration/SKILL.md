---
name: migration
description: Create a database migration following best practices. Updates Prisma schema and generates migration files.
argument-hint: [description of change]
---

# Create Migration: $ARGUMENTS

Generate database migration for: **$ARGUMENTS**

## Database Architecture

Per TECHNICAL_REQUIREMENTS.md, the database architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE (Supabase)                         │
│                                                                 │
│   PostgreSQL                                                    │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│   │ articles │  │ sources  │  │ fetches  │                      │
│   └──────────┘  └──────────┘  └──────────┘                      │
│                                                                 │
│   V2 Tables:                                                    │
│   ┌──────────┐  ┌──────────┐  ┌──────────────┐                  │
│   │  users   │  │bookmarks │  │ read_history │                  │
│   └──────────┘  └──────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Supabase Connection Configuration

**IMPORTANT:** Per TECHNICAL_REQUIREMENTS.md, Supabase uses connection pooling with different ports:

```env
# Application connection (pooled - port 6543)
# Use for: Application queries, Prisma Client
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migration connection (direct - port 5432)
# Use for: Migrations, schema changes, Prisma Studio
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

**Update `backend/prisma/schema.prisma`:**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Required for migrations with Supabase
}
```

> **Why?** PgBouncer (connection pooler) doesn't support all PostgreSQL features needed for migrations. The `directUrl` bypasses the pooler for schema operations.

---

## Pre-Migration Checklist

Before creating a migration, ensure:
- [ ] `DIRECT_URL` is set in `backend/.env` (required for Supabase migrations)
- [ ] You understand the current database schema
- [ ] The change is backward compatible (or you have a deployment plan)
- [ ] You've considered the impact on existing data
- [ ] Database is running and accessible

---

## Current Schema Reference

Per TECHNICAL_REQUIREMENTS.md, here's the complete schema structure:

### MVP Tables

#### `sources` - Content sources (RSS feeds, YouTube channels)
```prisma
model Source {
  id         String    @id @default(uuid())
  name       String    @unique @db.VarChar(100)
  slug       String    @unique @db.VarChar(50)
  type       String    @default("rss") @db.VarChar(20)  // 'rss' | 'youtube'
  feedUrl    String?   @map("feed_url")                 // For RSS sources
  channelId  String?   @map("channel_id") @db.VarChar(50) // V1: For YouTube
  websiteUrl String    @map("website_url")
  isActive   Boolean   @default(true) @map("is_active")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  articles   Article[]
  fetches    Fetch[]

  @@map("sources")
}
```

#### `articles` - Aggregated content with AI summaries
```prisma
model Article {
  id           String    @id @default(uuid())
  sourceId     String    @map("source_id")
  type         String    @default("article") @db.VarChar(20)  // 'article' | 'video'
  title        String    @db.VarChar(500)
  url          String    @unique
  summary      String?
  category     String?   @db.VarChar(20)  // V2: AI-assigned category
  contentHash  String    @map("content_hash") @db.VarChar(64)
  publishedAt  DateTime  @map("published_at")
  fetchedAt    DateTime  @default(now()) @map("fetched_at")
  summarizedAt DateTime? @map("summarized_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  source       Source    @relation(fields: [sourceId], references: [id])
  bookmarks    Bookmark[]    // V2
  readHistory  ReadHistory[] // V2

  @@index([sourceId])
  @@index([publishedAt(sort: Desc)])
  @@index([contentHash])
  @@index([type])      // V1: Filter by content type
  @@index([category])  // V2: Filter by category
  @@map("articles")
}
```

#### `fetches` - Fetch operation tracking
```prisma
model Fetch {
  id            String    @id @default(uuid())
  sourceId      String?   @map("source_id")
  status        String    @db.VarChar(20)  // 'pending' | 'running' | 'completed' | 'failed'
  articlesFound Int       @default(0) @map("articles_found")
  articlesNew   Int       @default(0) @map("articles_new")
  errorMessage  String?   @map("error_message")
  startedAt     DateTime  @default(now()) @map("started_at")
  completedAt   DateTime? @map("completed_at")

  source        Source?   @relation(fields: [sourceId], references: [id])

  @@index([status])
  @@map("fetches")
}
```

### V2 Tables

#### `users` - User accounts
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique @db.VarChar(255)
  createdAt DateTime @default(now()) @map("created_at")

  bookmarks   Bookmark[]
  readHistory ReadHistory[]

  @@map("users")
}
```

#### `bookmarks` - User bookmarked articles
```prisma
model Bookmark {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  articleId String   @map("article_id")
  createdAt DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
  @@index([userId])
  @@map("bookmarks")
}
```

#### `read_history` - Article read tracking
```prisma
model ReadHistory {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  articleId String   @map("article_id")
  readAt    DateTime @default(now()) @map("read_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
  @@index([userId])
  @@map("read_history")
}
```

---

## Migration Workflow

### 1. Update Prisma Schema
**Path:** `backend/prisma/schema.prisma`

Make your schema changes based on the reference above.

### 2. Generate Migration
```bash
cd backend

# Create and apply migration (development)
npx prisma migrate dev --name $ARGUMENTS

# This will:
# 1. Compare schema.prisma to current database state
# 2. Generate SQL migration file in prisma/migrations/
# 3. Apply the migration to development database
# 4. Regenerate Prisma Client
```

### 3. Review Generated Migration
**Path:** `backend/prisma/migrations/[timestamp]_$ARGUMENTS/migration.sql`

Verify the SQL looks correct before committing.

### 4. Test the Migration
```bash
# Check migration status
npx prisma migrate status

# Verify schema in visual browser
npx prisma studio

# Regenerate client if needed
npx prisma generate

# Run tests
npm test
```

---

## Version-Specific Migrations

### MVP → V1: Add YouTube Support

Per TECHNICAL_REQUIREMENTS.md V1: YouTube Pipeline

**Schema Changes:**
```prisma
model Source {
  // Existing fields...

  // V1: Add YouTube channel support
  channelId  String?   @map("channel_id") @db.VarChar(50)
}

model Article {
  // Existing fields...

  // V1: Add content type for videos
  type       String    @default("article") @db.VarChar(20)  // 'article' | 'video'

  @@index([type])  // V1: Filter by content type
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_youtube_support
```

**Generated SQL (expected):**
```sql
-- Add channelId to sources
ALTER TABLE "sources" ADD COLUMN "channel_id" VARCHAR(50);

-- Add type to articles with default
ALTER TABLE "articles" ADD COLUMN "type" VARCHAR(20) NOT NULL DEFAULT 'article';

-- Add index for type filtering
CREATE INDEX "articles_type_idx" ON "articles"("type");
```

---

### V1 → V2: Add User Features

Per TECHNICAL_REQUIREMENTS.md V2: User Accounts, Bookmarks, Search

**Step 1: Add User Tables**
```prisma
// Add to schema.prisma

model User {
  id        String   @id @default(uuid())
  email     String   @unique @db.VarChar(255)
  createdAt DateTime @default(now()) @map("created_at")

  bookmarks   Bookmark[]
  readHistory ReadHistory[]

  @@map("users")
}

model Bookmark {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  articleId String   @map("article_id")
  createdAt DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
  @@index([userId])
  @@map("bookmarks")
}

model ReadHistory {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  articleId String   @map("article_id")
  readAt    DateTime @default(now()) @map("read_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
  @@index([userId])
  @@map("read_history")
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_user_features
```

**Step 2: Add Category Field**
```prisma
model Article {
  // Existing fields...

  // V2: AI-assigned category
  category   String?   @db.VarChar(20)

  @@index([category])  // V2: Filter by category
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_article_category
```

---

### V2: Add Full-Text Search

Per TECHNICAL_REQUIREMENTS.md V2: Search Functionality

**Important:** PostgreSQL full-text search requires raw SQL migration.

**Step 1: Create Migration File**
```bash
npx prisma migrate dev --name add_fulltext_search --create-only
```

**Step 2: Edit Generated Migration**

Edit `backend/prisma/migrations/[timestamp]_add_fulltext_search/migration.sql`:

```sql
-- Add search_vector column to articles
ALTER TABLE "articles" ADD COLUMN "search_vector" tsvector;

-- Create GIN index for fast search
CREATE INDEX "idx_articles_search" ON "articles" USING GIN("search_vector");

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_article_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.summary, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update on insert/update
CREATE TRIGGER articles_search_vector_update
  BEFORE INSERT OR UPDATE ON "articles"
  FOR EACH ROW
  EXECUTE FUNCTION update_article_search_vector();

-- Backfill existing articles
UPDATE "articles" SET search_vector = to_tsvector('english',
  COALESCE(title, '') || ' ' || COALESCE(summary, '')
);
```

**Step 3: Apply Migration**
```bash
npx prisma migrate dev
```

**Note:** The `search_vector` column isn't directly represented in Prisma schema. You'll query it using raw SQL:

```typescript
// In article.service.ts
const articles = await prisma.$queryRaw`
  SELECT *, ts_rank(search_vector, plainto_tsquery('english', ${query})) as rank
  FROM articles
  WHERE search_vector @@ plainto_tsquery('english', ${query})
  ORDER BY rank DESC, published_at DESC
  LIMIT ${limit} OFFSET ${offset}
`;
```

---

## Index Reference

Per TECHNICAL_REQUIREMENTS.md, ensure these indexes exist:

### MVP Indexes
```sql
CREATE INDEX idx_articles_source_id ON articles(source_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_content_hash ON articles(content_hash);
CREATE INDEX idx_fetches_status ON fetches(status);
```

### V1 Indexes
```sql
CREATE INDEX idx_articles_type ON articles(type);
```

### V2 Indexes
```sql
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_read_history_user_id ON read_history(user_id);
```

**Prisma Schema Equivalent:**
```prisma
model Article {
  @@index([sourceId])
  @@index([publishedAt(sort: Desc)])
  @@index([contentHash])
  @@index([type])      // V1
  @@index([category])  // V2
}

model Fetch {
  @@index([status])
}

model Bookmark {
  @@index([userId])
}

model ReadHistory {
  @@index([userId])
}
```

---

## Prisma Commands Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npx prisma migrate dev --name <name>` | Create and apply migration | Development |
| `npx prisma migrate deploy` | Apply pending migrations | Production |
| `npx prisma migrate status` | Check migration status | Before deployment |
| `npx prisma migrate reset` | Reset database and reapply all | Development only |
| `npx prisma migrate dev --create-only` | Generate SQL without applying | Custom SQL needed |
| `npx prisma db push` | Push schema without migration file | Prototyping |
| `npx prisma generate` | Regenerate Prisma Client | After schema changes |
| `npx prisma studio` | Open visual database browser | Debugging |
| `npx prisma db seed` | Run seed script | Initial data |

---

## Safety Guidelines

### Safe Changes (Backward Compatible)
| Change | Why Safe |
|--------|----------|
| Adding nullable column | Existing rows get NULL |
| Adding column with default | Existing rows get default value |
| Adding new table | No impact on existing tables |
| Adding index | Only affects performance |
| Making required → optional | Loosens constraint |

### Unsafe Changes (Breaking)
| Change | Risk | Mitigation |
|--------|------|------------|
| Dropping column | Data loss | Two-phase: stop using, then drop |
| Dropping table | Data loss | Backup first, verify unused |
| Renaming column | Code breaks | Use `@map()` instead |
| Changing column type | Data conversion | Test thoroughly |
| Making optional → required | Fails if NULLs exist | Backfill data first |

### Handling Unsafe Changes

**Dropping a column (two-phase):**
```bash
# Phase 1: Deploy code that doesn't use the column
# Phase 2: Create migration to drop
npx prisma migrate dev --name drop_unused_column
```

**Renaming a column (use @map):**
```prisma
// Instead of renaming in database, use @map
model Article {
  publishDate DateTime @map("published_at")  // Field renamed, column stays same
}
```

**Making nullable → required:**
```bash
# Step 1: Backfill NULL values
npx prisma db execute --stdin <<< "UPDATE articles SET category = 'Uncategorized' WHERE category IS NULL;"

# Step 2: Apply migration making it required
npx prisma migrate dev --name make_category_required
```

---

## Data Migrations

For complex data transformations, create a script:

**Path:** `backend/prisma/data-migrations/[timestamp]_description.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Data migration: $ARGUMENTS
 * Run with: npx tsx prisma/data-migrations/[timestamp]_description.ts
 */
async function migrate() {
  console.log('Starting data migration...');

  const batchSize = 100;
  let processed = 0;
  let updated = 0;

  while (true) {
    const articles = await prisma.article.findMany({
      where: {
        category: null,
        summary: { not: null }  // Only articles with summaries
      },
      take: batchSize,
    });

    if (articles.length === 0) break;

    // Process in transaction for atomicity
    await prisma.$transaction(
      articles.map((article) =>
        prisma.article.update({
          where: { id: article.id },
          data: { category: 'News' },  // Default category
        })
      )
    );

    processed += articles.length;
    updated += articles.length;
    console.log(`Processed ${processed} records, updated ${updated}`);
  }

  console.log(`Data migration complete! Updated ${updated} records.`);
}

migrate()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

**Run:**
```bash
cd backend
npx tsx prisma/data-migrations/[timestamp]_description.ts
```

---

## Production Deployment

Per TECHNICAL_REQUIREMENTS.md deployment workflow:

### Pre-Deployment
```bash
cd backend

# 1. Check migration status
npx prisma migrate status

# 2. Review pending migrations
ls -la prisma/migrations/

# 3. Test migrations on staging first (if available)
DIRECT_URL="staging_direct_url" npx prisma migrate deploy
```

### Deploy Migrations
```bash
# Apply migrations to production
# Uses DIRECT_URL (port 5432) for direct database access
npx prisma migrate deploy
```

### Post-Deployment Verification
```bash
# Verify migration applied
npx prisma migrate status

# Check database structure
npx prisma studio

# Test application
curl https://your-backend.vercel.app/api/articles
```

### Rollback (if needed)
```bash
# Option 1: Supabase Point-in-Time Recovery
# Go to Supabase Dashboard → Database → Backups

# Option 2: Manual rollback (if migration supports it)
npx prisma migrate resolve --rolled-back <migration_name>

# Option 3: Restore from backup
psql $DIRECT_URL < backup.sql
```

---

## Troubleshooting

### "Migration failed to apply"
```bash
# Check status
npx prisma migrate status

# View migration history
ls -la prisma/migrations/

# For development, reset if needed (LOSES DATA!)
npx prisma migrate reset
```

### "Schema drift detected"
```bash
# Database doesn't match schema - common after manual changes
# Option 1: Create migration for the difference
npx prisma migrate dev

# Option 2: Push schema without migration (prototyping only)
npx prisma db push
```

### "Connection timeout" (Supabase)
```bash
# Ensure using DIRECT_URL for migrations
echo $DIRECT_URL  # Should use port 5432, not 6543

# Verify in schema.prisma
# directUrl = env("DIRECT_URL")
```

### "Cannot add NOT NULL column"
```prisma
// Solution: Add with default first
category String @default("Uncategorized")

// Then remove default in next migration if needed
```

### "Foreign key constraint failed"
```bash
# Check for orphaned records
npx prisma studio

# Clean up before adding constraint
npx prisma db execute --stdin <<< "DELETE FROM articles WHERE source_id NOT IN (SELECT id FROM sources);"
```

### "Prisma Client outdated"
```bash
npx prisma generate
```

---

## Checklist Summary

### Before Migration
- [ ] `DIRECT_URL` configured in `.env` (Supabase requirement)
- [ ] Schema changes defined in `schema.prisma`
- [ ] Change is backward compatible (or deployment planned)
- [ ] Development database accessible

### During Migration
- [ ] `npx prisma migrate dev --name <name>` succeeded
- [ ] Generated SQL reviewed
- [ ] Prisma Client regenerated (`npx prisma generate`)

### After Migration
- [ ] TypeScript compiles (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Application runs correctly
- [ ] `npx prisma studio` shows correct schema
- [ ] Data integrity verified

### Production Deployment
- [ ] Staging tested (if available)
- [ ] Backup created
- [ ] `npx prisma migrate deploy` succeeded
- [ ] API endpoints working
- [ ] No errors in logs

---

## Commit Message

```
feat(db): $ARGUMENTS

- Update Prisma schema with [changes]
- Add migration [timestamp]_$ARGUMENTS
- [Any data migration notes]
```
