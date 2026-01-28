---
name: migration
description: Create a database migration following best practices. Generates migration file with UP/DOWN operations and safety checks.
argument-hint: [description of change]
---

# Create Migration: $ARGUMENTS

Generate database migration for: **$ARGUMENTS**

## Pre-Migration Checklist

Before creating a migration, ensure:
- [ ] You understand the current database schema
- [ ] The change is backward compatible (or you have a deployment plan)
- [ ] You know how to roll back if something goes wrong
- [ ] You've considered the impact on existing data

## Implementation Steps

### 1. Update Drizzle Schema
**Path:** `apps/backend/src/db/schema.ts`

**Make your schema changes first:**
```typescript
// Example: Add new column
export const trends = pgTable('trends', {
  // ... existing columns
  newColumn: varchar('new_column', { length: 100 }),
});

// Example: Create new table
export const newTable = pgTable('new_table', {
  id: serial('id').primaryKey(),
  // ... columns
});

// Example: Add index
export const trends = pgTable('trends', {
  // ... columns
}, (table) => ({
  // ... existing indexes
  newIdx: index('idx_trends_new_column').on(table.newColumn),
}));
```

### 2. Generate Migration
**Command:**
```bash
cd apps/backend
npm run db:generate
```

This creates a new file in `src/db/migrations/` with SQL for your schema changes.

### 3. Review Generated Migration
**Path:** `apps/backend/src/db/migrations/XXXX_migration_name.sql`

**Ensure migration has:**
- [ ] Clear, descriptive SQL statements
- [ ] Both UP and DOWN operations
- [ ] Proper transaction boundaries
- [ ] Indexes for foreign keys
- [ ] Comments explaining complex changes

### 4. Add Safety Checks

**Common safety patterns:**

#### Adding a Non-Null Column to Existing Table
```sql
-- BAD: Will fail if table has data
ALTER TABLE trends ADD COLUMN new_column VARCHAR(100) NOT NULL;

-- GOOD: Add as nullable first, then update, then make non-null
ALTER TABLE trends ADD COLUMN new_column VARCHAR(100);
UPDATE trends SET new_column = 'default_value' WHERE new_column IS NULL;
ALTER TABLE trends ALTER COLUMN new_column SET NOT NULL;
```

#### Dropping a Column
```sql
-- Make sure column is not used in code first!
-- Add comment with date of when it's safe to drop
-- DROP after 2-4 weeks to ensure no old code is using it

-- Mark for deletion (optional)
COMMENT ON COLUMN trends.old_column IS 'DEPRECATED: Remove after 2026-02-28';

-- Actual drop (in future migration)
ALTER TABLE trends DROP COLUMN old_column;
```

#### Renaming a Column
```sql
-- BAD: Direct rename breaks existing code
ALTER TABLE trends RENAME COLUMN old_name TO new_name;

-- GOOD: Create new column, copy data, deprecate old (multi-step)
-- Migration 1: Add new column
ALTER TABLE trends ADD COLUMN new_name VARCHAR(100);
UPDATE trends SET new_name = old_name;

-- Deploy code that writes to both columns
-- Migration 2 (later): Drop old column
ALTER TABLE trends DROP COLUMN old_name;
```

### 5. Write UP Migration
```sql
-- Migration UP
BEGIN;

-- Add new column
ALTER TABLE trends
ADD COLUMN sentiment_score INTEGER CHECK (sentiment_score >= 1 AND sentiment_score <= 10);

-- Add index for performance
CREATE INDEX idx_trends_sentiment_score ON trends(sentiment_score);

-- Update existing rows with default value
UPDATE trends SET sentiment_score = 5 WHERE sentiment_score IS NULL;

-- Add comment
COMMENT ON COLUMN trends.sentiment_score IS 'AI-generated sentiment score from 1 (negative) to 10 (positive)';

COMMIT;
```

### 6. Write DOWN Migration
```sql
-- Migration DOWN (rollback)
BEGIN;

-- Remove index
DROP INDEX IF EXISTS idx_trends_sentiment_score;

-- Remove column
ALTER TABLE trends DROP COLUMN IF EXISTS sentiment_score;

COMMIT;
```

### 7. Test Migration

**Test UP migration:**
```bash
# Apply migration
npm run db:migrate

# Verify schema
psql -d ai_trends -c "\d+ trends"

# Check data
psql -d ai_trends -c "SELECT * FROM trends LIMIT 5;"
```

**Test DOWN migration (rollback):**
```bash
# Rollback
npm run db:rollback

# Verify rollback worked
psql -d ai_trends -c "\d+ trends"

# Re-apply to leave in migrated state
npm run db:migrate
```

### 8. Update TypeScript Types
**Path:** `packages/shared/types.ts`

**Add corresponding TypeScript types:**
```typescript
export interface Trend {
  // ... existing fields
  sentimentScore?: number;  // Match database column
}
```

### 9. Update Drizzle Schema (if not done in step 1)
Ensure `apps/backend/src/db/schema.ts` matches the migration.

## Migration Types

### Adding a Table
```sql
CREATE TABLE new_table (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_new_table_name ON new_table(name);
```

### Adding a Column
```sql
ALTER TABLE trends ADD COLUMN new_column VARCHAR(100);
```

### Adding an Index
```sql
CREATE INDEX idx_trends_category ON trends(category);
-- For faster queries filtering by category
```

### Adding a Foreign Key
```sql
ALTER TABLE trends
ADD COLUMN source_id INTEGER REFERENCES sources(id);

CREATE INDEX idx_trends_source_id ON trends(source_id);
```

### Dropping a Table
```sql
-- Only if you're SURE it's not needed!
DROP TABLE IF EXISTS old_table CASCADE;
```

### Creating a Composite Index
```sql
CREATE INDEX idx_trends_source_category ON trends(source_type, category);
-- For queries filtering by both source and category
```

## Safety Guidelines

### Backward Compatibility
✅ **Safe (backward compatible):**
- Adding a nullable column
- Adding a new table
- Adding an index
- Making a column nullable (from NOT NULL)

❌ **Unsafe (breaking changes):**
- Dropping a column still in use
- Renaming a column
- Changing column type
- Making a column NOT NULL
- Dropping a table

### Performance Considerations
⚠️ **Potentially slow operations:**
- Adding index to large table (lock during creation)
- Adding NOT NULL constraint with data migration
- Changing column type with USING clause

**Solutions:**
```sql
-- Create index concurrently (doesn't lock table)
CREATE INDEX CONCURRENTLY idx_trends_category ON trends(category);

-- Add NOT NULL constraint with validation
ALTER TABLE trends ADD COLUMN new_col VARCHAR(100);
-- Deploy code to write to new_col
UPDATE trends SET new_col = 'value';
ALTER TABLE trends ALTER COLUMN new_col SET NOT NULL;
```

### Data Migrations
When migrating existing data:
```sql
-- Always use WHERE clause to avoid mistakes
UPDATE trends
SET category = 'News'
WHERE category IS NULL AND source_type = 'rss';

-- Use transactions
BEGIN;
  UPDATE trends SET status = 'active' WHERE status IS NULL;
  -- If something fails, everything rolls back
COMMIT;

-- Log progress for large updates
DO $$
DECLARE
  total_rows INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_rows FROM trends WHERE category IS NULL;
  RAISE NOTICE 'Updating % rows', total_rows;

  UPDATE trends SET category = 'News' WHERE category IS NULL;

  RAISE NOTICE 'Update complete';
END $$;
```

## Testing Checklist

Before deploying migration:
- [ ] Migration applies successfully on dev database
- [ ] Rollback works correctly
- [ ] No data loss during UP migration
- [ ] No data loss during DOWN migration
- [ ] Indexes are created
- [ ] Foreign keys work correctly
- [ ] Application code works with new schema
- [ ] Tests pass with new schema
- [ ] Performance is acceptable (test with production-like data)

## Deployment Process

### 1. Development
```bash
# Create migration
npm run db:generate

# Test
npm run db:migrate
npm test

# Test rollback
npm run db:rollback
npm run db:migrate
```

### 2. Staging
```bash
# Deploy to staging environment
npm run db:migrate

# Run integration tests
npm run test:integration

# Verify application works
curl http://staging-api/health
```

### 3. Production
```bash
# Backup database first!
pg_dump ai_trends > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply migration
npm run db:migrate

# Monitor logs
tail -f logs/combined.log

# If issues, rollback
npm run db:rollback

# Restore from backup if necessary
psql ai_trends < backup_20260128_120000.sql
```

## Common Migration Patterns

### Add Enum Type
```sql
-- Create enum
CREATE TYPE trend_status AS ENUM ('pending', 'processed', 'failed');

-- Use in table
ALTER TABLE trends ADD COLUMN status trend_status DEFAULT 'pending';
```

### Add Timestamp Triggers
```sql
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to table
CREATE TRIGGER update_trends_updated_at
BEFORE UPDATE ON trends
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Add JSON Column
```sql
ALTER TABLE trends ADD COLUMN metadata JSONB;

-- Add index for JSON queries
CREATE INDEX idx_trends_metadata ON trends USING GIN (metadata);
```

## Documentation

Update `docs/DATABASE.md` with:
- What changed
- Why it changed
- Impact on existing data
- Required application code changes

## Common Issues

**Issue:** Migration fails with "column already exists"
- Solution: Check if migration was partially applied, rollback and reapply

**Issue:** Rollback fails
- Solution: Write defensive DOWN migrations with IF EXISTS

**Issue:** Data migration takes too long
- Solution: Break into smaller batches, use WHERE clauses

**Issue:** Application breaks after migration
- Solution: Ensure TypeScript types match new schema

---

**Next Steps:**
1. Update Drizzle schema in `apps/backend/src/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Review and enhance generated migration
4. Test UP migration
5. Test DOWN migration
6. Update TypeScript types
7. Run application tests
8. Commit with message: `feat(db): $ARGUMENTS`
9. Deploy to staging first, then production
