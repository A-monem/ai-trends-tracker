---
name: api-endpoint
description: Create a new REST API endpoint following project conventions. Generates route, controller, service, types, and tests.
argument-hint: [METHOD] [/path] [description]
---

# Create API Endpoint: $ARGUMENTS

Generate endpoint: **$0 $1** - $2

## Implementation Checklist

### 1. Add TypeScript Types
**Path:** `packages/shared/types.ts`

**Add request/response interfaces:**
```typescript
// Request type (if POST/PATCH with body)
export interface Create${EntityName}Request {
  // Request body fields
}

// Response type
export interface ${EntityName}Response {
  // Response fields
}

// Or for lists:
export interface ${EntityName}ListResponse {
  items: ${EntityName}[];
  pagination: Pagination;
}
```

### 2. Create Service Layer
**Path:** `apps/backend/src/services/${entity}.service.ts`

**Implement business logic:**
```typescript
import { db } from '../db';
import { ${tableName} } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

export class ${EntityName}Service {
  async ${methodName}(/* parameters */): Promise<${ReturnType}> {
    try {
      logger.info('${EntityName}Service.${methodName}');

      // Database query using Drizzle ORM
      const result = await db
        .select()
        .from(${tableName})
        // .where(...)
        .limit(10);

      return result;

    } catch (error) {
      logger.error('${EntityName}Service.${methodName} error:', error);
      throw error;
    }
  }
}
```

### 3. Create Controller
**Path:** `apps/backend/src/controllers/${entity}.controller.ts`

**Handle HTTP request/response:**
```typescript
import { Request, Response, NextFunction } from 'express';
import { ${EntityName}Service } from '../services/${entity}.service';
import { logger } from '../utils/logger';

const service = new ${EntityName}Service();

export class ${EntityName}Controller {
  async ${methodName}(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extract parameters from req.params, req.query, req.body
      const { id } = req.params;
      const { page, limit } = req.query;

      // Call service
      const result = await service.${methodName}(/* params */);

      // Return response
      res.json({
        data: result,
        message: 'Success'
      });

    } catch (error) {
      next(error);
    }
  }
}
```

### 4. Create Route
**Path:** `apps/backend/src/routes/${entity}.routes.ts` (or add to existing)

**Define route:**
```typescript
import { Router } from 'express';
import { ${EntityName}Controller } from '../controllers/${entity}.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();
const controller = new ${EntityName}Controller();

// Validation schema (if needed)
const ${methodName}Schema = z.object({
  // Define schema
});

// Define route
router.$0('$1',
  validate(${methodName}Schema), // Optional validation
  controller.${methodName}.bind(controller)
);

export default router;
```

### 5. Register Route in Main App
**Path:** `apps/backend/src/index.ts`

**Import and use router:**
```typescript
import ${entity}Routes from './routes/${entity}.routes';

// Add to app
app.use('/api/${entity}', ${entity}Routes);
```

### 6. Create Tests
**Path:** `apps/backend/src/routes/__tests__/${entity}.routes.test.ts`

**Test the endpoint:**
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../index';

describe('$0 $1', () => {
  it('should return successful response', async () => {
    const response = await request(app)
      .$0('$1')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });

  it('should validate input', async () => {
    const response = await request(app)
      .$0('$1')
      .send({ /* invalid data */ })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should handle errors gracefully', async () => {
    // Test error scenarios
  });
});
```

### 7. Create Frontend API Client
**Path:** `apps/frontend/src/services/api.ts`

**Add API method:**
```typescript
export const ${entity}API = {
  ${methodName}: async (/* params */): Promise<${ReturnType}> => {
    const response = await api.$0('$1', /* data */);
    return response.data;
  },
};
```

### 8. Create React Query Hook
**Path:** `apps/frontend/src/hooks/use${EntityName}.ts`

**Create custom hook:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ${entity}API } from '../services/api';

// For GET requests (queries)
export function use${EntityName}(/* params */) {
  return useQuery({
    queryKey: ['${entity}', /* params */],
    queryFn: () => ${entity}API.${methodName}(/* params */),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// For POST/PATCH/DELETE requests (mutations)
export function use${ActionName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ${RequestType}) => ${entity}API.${methodName}(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
    },
  });
}
```

## HTTP Method Guidelines

### GET - Read Data
```typescript
// Get list
router.get('/', controller.getAll);        // GET /api/trends

// Get single item
router.get('/:id', controller.getById);    // GET /api/trends/:id

// With query parameters
router.get('/', controller.search);         // GET /api/trends?q=search&page=1
```

### POST - Create New Resource
```typescript
// Create
router.post('/', validate(createSchema), controller.create);

// Custom action
router.post('/refresh', controller.refresh);  // POST /api/trends/refresh
```

### PATCH - Partial Update
```typescript
// Update specific field
router.patch('/:id/read', controller.markAsRead);       // PATCH /api/trends/:id/read

// Update multiple fields
router.patch('/:id', validate(updateSchema), controller.update);
```

### DELETE - Remove Resource
```typescript
// Delete
router.delete('/:id', controller.delete);    // DELETE /api/trends/:id
```

## Validation with Zod

```typescript
import { z } from 'zod';

// Define schema
const createTrendSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(500),
    url: z.string().url(),
    sourceType: z.enum(['rss', 'youtube', 'reddit', 'hackernews']),
    category: z.string().optional(),
  }),
});

// Validation middleware
const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
};
```

## Response Format Standards

### Success Response
```typescript
res.json({
  data: result,
  message: 'Operation successful'
});
```

### Error Response
```typescript
res.status(400).json({
  error: 'Error message',
  details: { /* additional context */ }
});
```

### Paginated Response
```typescript
res.json({
  data: {
    items: results,
    pagination: {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5
    }
  }
});
```

## Error Handling

```typescript
// In controller
try {
  const result = await service.method();
  res.json({ data: result });
} catch (error) {
  next(error); // Pass to error middleware
}

// Global error middleware (in index.ts)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('API Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});
```

## Testing the Endpoint

```bash
# Using curl
curl http://localhost:4000/api/${entity}

# Using curl with JSON body
curl -X POST http://localhost:4000/api/${entity} \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# Using curl with query parameters
curl "http://localhost:4000/api/${entity}?page=1&limit=10"

# Run tests
npm test -- ${entity}.routes.test.ts
```

## Common Patterns

### Pagination
```typescript
const page = parseInt(req.query.page as string) || 1;
const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
const offset = (page - 1) * limit;

const [items, countResult] = await Promise.all([
  db.select().from(table).limit(limit).offset(offset),
  db.select({ count: sql<number>`count(*)` }).from(table),
]);

const total = countResult[0]?.count || 0;

res.json({
  data: {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  },
});
```

### Filtering
```typescript
const filters = [];

if (req.query.category) {
  filters.push(eq(trends.category, req.query.category as string));
}

if (req.query.isRead !== undefined) {
  filters.push(eq(trends.isRead, req.query.isRead === 'true'));
}

const whereClause = filters.length > 0 ? and(...filters) : undefined;

const results = await db
  .select()
  .from(trends)
  .where(whereClause);
```

### Sorting
```typescript
const sortBy = req.query.sortBy as string || 'publishedAt';
const sortOrder = req.query.sortOrder === 'asc' ? asc : desc;

const results = await db
  .select()
  .from(trends)
  .orderBy(sortOrder(trends[sortBy]));
```

## Documentation

Update `docs/API.md` with:
```markdown
### $0 $1

**Description:** $2

**Request:**
\`\`\`
$0 $1
\`\`\`

**Query Parameters:**
- `param1` (type) - description

**Request Body:**
\`\`\`json
{
  "field": "value"
}
\`\`\`

**Response:**
\`\`\`json
{
  "data": {},
  "message": "Success"
}
\`\`\`

**Error Codes:**
- `400` - Bad Request (validation failed)
- `404` - Not Found
- `500` - Internal Server Error
```

---

**Next Steps:**
1. Add types to `packages/shared/types.ts`
2. Create service in `apps/backend/src/services/`
3. Create controller in `apps/backend/src/controllers/`
4. Create/update route in `apps/backend/src/routes/`
5. Register route in `apps/backend/src/index.ts`
6. Write tests in `apps/backend/src/routes/__tests__/`
7. Create frontend API client method
8. Create React Query hook
9. Test with curl
10. Commit with message: `feat: add $0 $1 endpoint`
