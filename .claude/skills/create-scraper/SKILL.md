---
name: create-scraper
description: Generate a new content scraper following project conventions. Creates scraper class, tests, and registers it in the factory.
argument-hint: [source-name] [source-type]
---

# Create Scraper: $ARGUMENTS

Generate a new scraper for **$0** of type **$1** with full boilerplate, tests, and registration.

## Implementation Checklist

### 1. Create Scraper File
**Path:** `apps/backend/src/scrapers/$0Scraper.ts`

**Requirements:**
- [ ] Extends `BaseScraper` interface from `./base.scraper.ts`
- [ ] Implements all required methods: `canScrape()`, `scrape()`, `normalizeUrl()`
- [ ] Includes proper TypeScript types
- [ ] Has error handling with try-catch
- [ ] Implements rate limiting (max 1 req/sec)
- [ ] Uses Winston logger for all logging
- [ ] Returns `ScraperResult[]` in correct format

**Template Structure:**
```typescript
import { BaseScraper, ScraperResult } from './base.scraper';
import { logger } from '../utils/logger';
// Import required libraries based on $1 type

export class $0Scraper extends BaseScraper {
  name = '$0';
  type = '$1' as const;

  // Type-specific properties (API keys, URLs, etc.)

  constructor() {
    super();
    // Initialize properties
  }

  canScrape(): boolean {
    // Check if required credentials/config are present
    return true;
  }

  async scrape(maxItems = 50): Promise<ScraperResult[]> {
    try {
      logger.info(`[$0] Starting scrape...`);

      // Implementation based on source type:
      // - RSS: Use rss-parser
      // - YouTube: Use YouTube Data API v3
      // - Reddit: Use Reddit JSON API
      // - HackerNews: Use Firebase API
      // - API: Use axios with proper headers

      logger.info(`[$0] Scraped X items`);
      return results;

    } catch (error: any) {
      this.handleError(error, 'Failed to scrape');
    }
  }
}
```

### 2. Create Test File
**Path:** `apps/backend/src/scrapers/__tests__/$0Scraper.test.ts`

**Requirements:**
- [ ] Test `canScrape()` returns correct value
- [ ] Test `scrape()` with mocked HTTP responses
- [ ] Test error handling (network failure, invalid data)
- [ ] Test data normalization (correct ScraperResult format)
- [ ] Test rate limiting compliance

**Template:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { $0Scraper } from '../$0Scraper';

describe('$0Scraper', () => {
  let scraper: $0Scraper;

  beforeEach(() => {
    scraper = new $0Scraper();
  });

  it('should validate configuration', () => {
    expect(scraper.canScrape()).toBe(true);
  });

  it('should scrape and return results', async () => {
    // Mock HTTP response
    // const results = await scraper.scrape(10);
    // expect(results).toHaveLength(10);
  });

  it('should handle errors gracefully', async () => {
    // Test error handling
  });
});
```

### 3. Register in Scraper Factory
**Path:** `apps/backend/src/scrapers/factory.ts`

**Add to `createFromSource()` method:**
```typescript
import { $0Scraper } from './$0Scraper';

// In switch statement:
case '$1':
  return new $0Scraper();
```

### 4. Add to Database Seed
**Path:** `apps/backend/src/db/seed.ts`

**Add source to seed data:**
```typescript
{
  name: '$0',
  type: '$1',
  url: 'URL_FOR_SOURCE',
  config: { /* type-specific config */ },
  isActive: true
}
```

### 5. Validation Steps

After implementation, verify:
- [ ] TypeScript compiles with no errors: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Scraper can be instantiated from factory
- [ ] Manual test returns real data: `tsx src/scrapers/$0Scraper.ts`
- [ ] Logs output to Winston logger
- [ ] Rate limiting works (check request timing)

### 6. Documentation

Update `docs/SCRAPERS.md` (create if doesn't exist) with:
- Source name and type
- Required environment variables
- Rate limits
- Data structure returned
- Known limitations

## Source Type Guidelines

### RSS Feeds
- **Library:** `rss-parser`
- **Rate limit:** 1 request per 5 seconds
- **Required:** Feed URL
- **Returns:** Articles with title, link, pubDate, content

### YouTube
- **Library:** `axios` for YouTube Data API v3
- **Rate limit:** 10,000 units/day (each search = ~100 units)
- **Required:** `YOUTUBE_API_KEY` environment variable
- **Returns:** Videos with title, videoId, channelTitle, thumbnails

### Reddit
- **Library:** `axios` for Reddit JSON API
- **Rate limit:** 60 requests per minute
- **Required:** User-Agent header
- **Returns:** Posts with title, url, score, subreddit

### Hacker News
- **Library:** `axios` for Firebase API
- **Rate limit:** No official limit (be respectful)
- **Required:** None (public API)
- **Returns:** Stories with title, url, score, comments

### Generic API
- **Library:** `axios` with proper headers
- **Rate limit:** Check API documentation
- **Required:** API key (if needed)
- **Returns:** Depends on API

## Error Handling Patterns

```typescript
// Network errors
try {
  const response = await axios.get(url);
} catch (error: any) {
  if (error.code === 'ENOTFOUND') {
    logger.error(`[$0] DNS lookup failed`);
  } else if (error.response?.status === 429) {
    logger.warn(`[$0] Rate limited, backing off`);
  } else {
    this.handleError(error, 'Network request failed');
  }
}

// Data validation
const results = rawData.map(item => {
  if (!item.title || !item.url) {
    logger.warn(`[$0] Skipping item with missing required fields`);
    return null;
  }
  return {
    title: item.title,
    url: item.url,
    normalizedUrl: this.normalizeUrl(item.url),
    publishedAt: new Date(item.pubDate || Date.now()),
    // ...
  };
}).filter(Boolean);
```

## Rate Limiting Implementation

```typescript
// Simple delay between requests
for (const item of items) {
  await processItem(item);
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
}

// Or use a rate limiter library like bottleneck
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  minTime: 1000, // 1 request per second
  maxConcurrent: 1
});

const results = await Promise.all(
  items.map(item => limiter.schedule(() => processItem(item)))
);
```

## Testing the Scraper

```bash
# Run unit tests
cd apps/backend
npm test -- $0Scraper

# Manual test (create a test script)
cat > test-scraper.ts << EOF
import { $0Scraper } from './src/scrapers/$0Scraper';

async function test() {
  const scraper = new $0Scraper();

  if (!scraper.canScrape()) {
    console.error('Scraper not configured correctly');
    return;
  }

  const results = await scraper.scrape(5);
  console.log(\`Scraped \${results.length} items:\`);
  results.forEach(r => console.log('- ', r.title));
}

test();
EOF

tsx test-scraper.ts
rm test-scraper.ts
```

## Common Issues

**Issue:** "API key not found"
- Solution: Add required environment variable to `.env`

**Issue:** "Rate limited"
- Solution: Increase delay between requests

**Issue:** "Invalid data format"
- Solution: Log raw response, verify parsing logic

**Issue:** "Tests failing"
- Solution: Check mocked responses match actual API format

---

**Next Steps:**
1. Implement the scraper in `apps/backend/src/scrapers/$0Scraper.ts`
2. Write tests in `__tests__/$0Scraper.test.ts`
3. Register in `factory.ts`
4. Add to `seed.ts`
5. Test manually
6. Commit with message: `feat: add $0 scraper`
