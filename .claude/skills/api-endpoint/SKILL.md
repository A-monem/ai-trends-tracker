---
name: api-endpoint
description: Create a new REST API endpoint following project conventions. Generates route, controller, service, Zod schema, and tests.
argument-hint: [METHOD] [/path] [description]
---

# Create API Endpoint: $ARGUMENTS

Generate endpoint: **$0 $1** - $2

## Architecture Context

Per TECHNICAL_REQUIREMENTS.md, the API follows this structure:

```
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Vercel)                       │
│                                                                 │
│   Express.js + Zod Validation                                   │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│   │  Articles   │  │   Sources   │  │   Scraper   │             │
│   │  Controller │  │  Controller │  │   Service   │             │
│   └─────────────┘  └─────────────┘  └─────────────┘             │
│                                            │                    │
│                                            ▼                    │
│                                   ┌─────────────────┐           │
│                                   │  Claude API     │           │
│                                   │  (Anthropic)    │           │
│                                   └─────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## Existing API Endpoints Reference

Before creating a new endpoint, check if it's already defined in TECHNICAL_REQUIREMENTS.md:

### MVP Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/articles` | List articles (paginated) | MVP |
| GET | `/api/articles/:id` | Get single article with summary | MVP |
| GET | `/api/sources` | List all active sources | MVP |
| POST | `/api/refresh` | Trigger manual content refresh | MVP |
| GET | `/api/refresh/status` | Get latest fetch status | MVP |

### V1 Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/cron/refresh` | Automated refresh (Vercel Cron) | V1 |

### V2 Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/articles/search` | Full-text search | V2 |
| POST | `/api/auth/signup` | Create account | V2 |
| POST | `/api/auth/login` | Login | V2 |
| POST | `/api/auth/logout` | Logout | V2 |
| GET | `/api/auth/me` | Get current user | V2 |
| GET | `/api/user/bookmarks` | Get user's bookmarks | V2 |
| POST | `/api/user/bookmarks/:id` | Add bookmark | V2 |
| DELETE | `/api/user/bookmarks/:id` | Remove bookmark | V2 |
| POST | `/api/user/read/:id` | Mark article as read | V2 |
| GET | `/api/user/export` | Export bookmarks | V2 |

---

## Implementation Checklist

### 1. Create Zod Schema
**Path:** `backend/src/schemas/${entity}.schemas.ts`

Per TECHNICAL_REQUIREMENTS.md, all validation uses Zod schemas.

```typescript
import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

/**
 * Query parameters for listing ${entity}
 * Per TECHNICAL_REQUIREMENTS.md: Paginated Response format
 */
export const ${EntityName}ListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  // Add filters based on endpoint requirements
});

/**
 * Request body for creating ${entity}
 */
export const Create${EntityName}Schema = z.object({
  // Define required fields
  // Example: title: z.string().min(1).max(500),
});

/**
 * Request body for updating ${entity}
 */
export const Update${EntityName}Schema = Create${EntityName}Schema.partial();

/**
 * Path parameters with ID
 */
export const ${EntityName}IdParamSchema = z.object({
  id: z.string().uuid(),
});

// ============================================
// Type Exports (inferred from schemas)
// ============================================

export type ${EntityName}ListQuery = z.infer<typeof ${EntityName}ListQuerySchema>;
export type Create${EntityName}Input = z.infer<typeof Create${EntityName}Schema>;
export type Update${EntityName}Input = z.infer<typeof Update${EntityName}Schema>;
```

**Example: Article Filter Schema (from TECHNICAL_REQUIREMENTS.md V2)**
```typescript
// backend/src/schemas/article.schemas.ts

export const ArticleFilterSchema = z.object({
  source: z.string().optional(),           // Comma-separated slugs
  type: z.enum(['article', 'video', 'discussion']).optional(),
  from: z.string().datetime().optional(),  // ISO date
  to: z.string().datetime().optional(),    // ISO date
  category: z.string().optional(),         // Comma-separated categories
  unread: z.coerce.boolean().optional(),   // V2: Requires auth
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export type ArticleFilter = z.infer<typeof ArticleFilterSchema>;
```

### 2. Create Service Layer
**Path:** `backend/src/services/${entity}.service.ts`

```typescript
import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import type { ${EntityName}ListQuery, Create${EntityName}Input } from '../schemas/${entity}.schemas';

const prisma = new PrismaClient();

export class ${EntityName}Service {
  /**
   * Get paginated list of ${entity}
   * Per TECHNICAL_REQUIREMENTS.md: Returns paginated response format
   */
  async list(query: ${EntityName}ListQuery) {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    // Build where clause from filters
    const where: Prisma.${ModelName}WhereInput = {};

    // Add filter conditions based on query params
    // Example for articles:
    // if (filters.source) {
    //   where.source = { slug: { in: filters.source.split(',') } };
    // }

    // Execute query with count for pagination
    const [items, total] = await Promise.all([
      prisma.${modelName}.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          // Add relations as needed
        },
      }),
      prisma.${modelName}.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single ${entity} by ID
   */
  async getById(id: string) {
    const item = await prisma.${modelName}.findUnique({
      where: { id },
      include: {
        // Add relations as needed
      },
    });

    if (!item) {
      const error = new Error('${EntityName} not found') as any;
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return item;
  }

  /**
   * Create new ${entity}
   */
  async create(data: Create${EntityName}Input) {
    try {
      return await prisma.${modelName}.create({
        data: {
          ...data,
          // Add computed fields
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        const err = new Error('${EntityName} already exists') as any;
        err.status = 409;
        err.code = 'DUPLICATE';
        throw err;
      }
      throw error;
    }
  }

  /**
   * Update ${entity}
   */
  async update(id: string, data: Partial<Create${EntityName}Input>) {
    // Verify exists first
    await this.getById(id);

    return await prisma.${modelName}.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete ${entity}
   */
  async delete(id: string) {
    // Verify exists first
    await this.getById(id);

    await prisma.${modelName}.delete({
      where: { id },
    });
  }
}

// Export singleton instance
export const ${entityName}Service = new ${EntityName}Service();
```

### 3. Create Controller
**Path:** `backend/src/controllers/${entity}.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ${entityName}Service } from '../services/${entity}.service';
import {
  ${EntityName}ListQuerySchema,
  Create${EntityName}Schema,
  Update${EntityName}Schema,
  ${EntityName}IdParamSchema,
} from '../schemas/${entity}.schemas';
import { logger } from '../utils/logger';

/**
 * ${EntityName} Controller
 * Handles HTTP requests for ${entity} endpoints
 *
 * Response format per TECHNICAL_REQUIREMENTS.md:
 * Success: { success: true, data: {...} }
 * Error: { success: false, error: { code, message } }
 * Paginated: { success: true, data: [...], pagination: {...} }
 */
export class ${EntityName}Controller {
  /**
   * GET /api/${entity}
   * List ${entity} with pagination and filters
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = ${EntityName}ListQuerySchema.parse(req.query);
      const result = await ${entityName}Service.list(query);

      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/${entity}/:id
   * Get single ${entity} by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = ${EntityName}IdParamSchema.parse(req.params);
      const item = await ${entityName}Service.getById(id);

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/${entity}
   * Create new ${entity}
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = Create${EntityName}Schema.parse(req.body);
      const item = await ${entityName}Service.create(data);

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/${entity}/:id
   * Update ${entity}
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = ${EntityName}IdParamSchema.parse(req.params);
      const data = Update${EntityName}Schema.parse(req.body);
      const item = await ${entityName}Service.update(id, data);

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/${entity}/:id
   * Delete ${entity}
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = ${EntityName}IdParamSchema.parse(req.params);
      await ${entityName}Service.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const ${entityName}Controller = new ${EntityName}Controller();
```

### 4. Create Routes
**Path:** `backend/src/routes/${entity}.routes.ts`

```typescript
import { Router } from 'express';
import { ${entityName}Controller } from '../controllers/${entity}.controller';
// V2: Import auth middleware if needed
// import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * ${EntityName} Routes
 * Base path: /api/${entity}
 */

// GET /api/${entity} - List all (paginated)
router.get('/', ${entityName}Controller.list.bind(${entityName}Controller));

// GET /api/${entity}/:id - Get by ID
router.get('/:id', ${entityName}Controller.getById.bind(${entityName}Controller));

// POST /api/${entity} - Create new
router.post('/', ${entityName}Controller.create.bind(${entityName}Controller));

// PATCH /api/${entity}/:id - Update
router.patch('/:id', ${entityName}Controller.update.bind(${entityName}Controller));

// DELETE /api/${entity}/:id - Delete
router.delete('/:id', ${entityName}Controller.delete.bind(${entityName}Controller));

export default router;
```

### 5. Register Route in App
**Path:** `backend/src/app.ts`

```typescript
import ${entity}Routes from './routes/${entity}.routes';

// Register routes
app.use('/api/${entity}', ${entity}Routes);
```

### 6. Create Validation Middleware
**Path:** `backend/src/middleware/validation.middleware.ts`

Per TECHNICAL_REQUIREMENTS.md, use Zod for runtime schema validation.

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { logger } from '../utils/logger';

/**
 * Validation middleware factory
 * Validates request against Zod schema
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error:', error.errors);

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      } else {
        next(error);
      }
    }
  };
}
```

### 7. Create Error Middleware
**Path:** `backend/src/middleware/error.middleware.ts`

Per TECHNICAL_REQUIREMENTS.md error response format.

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

/**
 * Error codes per TECHNICAL_REQUIREMENTS.md
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  DUPLICATE: 'DUPLICATE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

/**
 * Global error handler middleware
 * Returns standardized error response format
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('API Error:', {
    message: err.message,
    code: err.code,
    status: err.status,
    path: req.path,
    method: req.method,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Invalid request data',
        details: err.errors,
      },
    });
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: {
        code: ErrorCodes.DUPLICATE,
        message: 'Resource already exists',
      },
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: {
        code: ErrorCodes.NOT_FOUND,
        message: 'Resource not found',
      },
    });
  }

  // Handle custom errors with status
  const status = err.status || 500;
  const code = err.code || ErrorCodes.INTERNAL_ERROR;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}
```

---

## V1: Cron Endpoint Pattern

Per TECHNICAL_REQUIREMENTS.md, cron endpoints require authorization.

**Path:** `backend/src/routes/cron.routes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { refreshAllSources } from '../services/scraper.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/cron/refresh
 * Automated refresh triggered by Vercel Cron
 * Per TECHNICAL_REQUIREMENTS.md V1: Automated Refresh
 */
router.post('/refresh', async (req: Request, res: Response) => {
  // Verify request is from Vercel Cron
  const authHeader = req.headers['authorization'];

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    logger.warn('Unauthorized cron request attempt');
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid cron authorization',
      },
    });
  }

  try {
    logger.info('Cron refresh triggered');
    const result = await refreshAllSources();

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Cron refresh failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Refresh failed',
      },
    });
  }
});

export default router;
```

**Vercel Cron Configuration** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/refresh",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Environment Variable:**
```env
CRON_SECRET=your-secret-here
```

---

## V2: Auth Middleware Pattern

Per TECHNICAL_REQUIREMENTS.md V2, protected endpoints require authentication.

**Path:** `backend/src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies Supabase JWT and attaches user to request
 * Per TECHNICAL_REQUIREMENTS.md V2: User Accounts
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
    }

    req.user = {
      id: user.id,
      email: user.email!,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed',
      },
    });
  }
}

/**
 * Optional auth middleware
 * Attaches user if authenticated, but doesn't require it
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    const { data: { user } } = await supabase.auth.getUser(token);

    if (user) {
      req.user = {
        id: user.id,
        email: user.email!,
      };
    }
  } catch (error) {
    // Ignore auth errors for optional auth
  }

  next();
}
```

**Usage in V2 Protected Routes:**
```typescript
import { requireAuth } from '../middleware/auth.middleware';

// Protected route
router.get('/user/bookmarks', requireAuth, bookmarkController.list);
router.post('/user/bookmarks/:id', requireAuth, bookmarkController.add);
router.delete('/user/bookmarks/:id', requireAuth, bookmarkController.remove);
```

---

## Create Tests

**Path:** `backend/tests/routes/${entity}.routes.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    ${modelName}: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new PrismaClient();

describe('${EntityName} API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/${entity}', () => {
    it('should return paginated list', async () => {
      const mockItems = [
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' },
      ];

      (prisma.${modelName}.findMany as any).mockResolvedValue(mockItems);
      (prisma.${modelName}.count as any).mockResolvedValue(2);

      const response = await request(app)
        .get('/api/${entity}')
        .query({ page: 1, limit: 20 })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockItems,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/${entity}')
        .query({ page: -1 })  // Invalid
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
        },
      });
    });
  });

  describe('GET /api/${entity}/:id', () => {
    it('should return single item', async () => {
      const mockItem = { id: 'test-uuid', name: 'Test' };
      (prisma.${modelName}.findUnique as any).mockResolvedValue(mockItem);

      const response = await request(app)
        .get('/api/${entity}/test-uuid')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockItem,
      });
    });

    it('should return 404 for non-existent item', async () => {
      (prisma.${modelName}.findUnique as any).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/${entity}/non-existent-uuid')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
        },
      });
    });

    it('should validate UUID format', async () => {
      const response = await request(app)
        .get('/api/${entity}/invalid-id')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
        },
      });
    });
  });

  describe('POST /api/${entity}', () => {
    it('should create new item', async () => {
      const input = { name: 'New Item' };
      const mockCreated = { id: 'new-uuid', ...input };

      (prisma.${modelName}.create as any).mockResolvedValue(mockCreated);

      const response = await request(app)
        .post('/api/${entity}')
        .send(input)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockCreated,
      });
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/${entity}')
        .send({})  // Missing required fields
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
        },
      });
    });

    it('should handle duplicate entries', async () => {
      const error = new Error('Unique constraint violation') as any;
      error.code = 'P2002';

      (prisma.${modelName}.create as any).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/${entity}')
        .send({ name: 'Duplicate' })
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'DUPLICATE',
        },
      });
    });
  });

  describe('PATCH /api/${entity}/:id', () => {
    it('should update existing item', async () => {
      const mockExisting = { id: 'test-uuid', name: 'Original' };
      const mockUpdated = { id: 'test-uuid', name: 'Updated' };

      (prisma.${modelName}.findUnique as any).mockResolvedValue(mockExisting);
      (prisma.${modelName}.update as any).mockResolvedValue(mockUpdated);

      const response = await request(app)
        .patch('/api/${entity}/test-uuid')
        .send({ name: 'Updated' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUpdated,
      });
    });
  });

  describe('DELETE /api/${entity}/:id', () => {
    it('should delete existing item', async () => {
      const mockExisting = { id: 'test-uuid', name: 'To Delete' };

      (prisma.${modelName}.findUnique as any).mockResolvedValue(mockExisting);
      (prisma.${modelName}.delete as any).mockResolvedValue(mockExisting);

      await request(app)
        .delete('/api/${entity}/test-uuid')
        .expect(204);
    });
  });
});
```

**Path:** `backend/tests/services/${entity}.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ${EntityName}Service } from '../../src/services/${entity}.service';
import { PrismaClient } from '@prisma/client';

vi.mock('@prisma/client', () => {
  const mockPrisma = {
    ${modelName}: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new PrismaClient();

describe('${EntityName}Service', () => {
  let service: ${EntityName}Service;

  beforeEach(() => {
    service = new ${EntityName}Service();
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated results', async () => {
      const mockItems = [{ id: '1' }, { id: '2' }];
      (prisma.${modelName}.findMany as any).mockResolvedValue(mockItems);
      (prisma.${modelName}.count as any).mockResolvedValue(2);

      const result = await service.list({ page: 1, limit: 20 });

      expect(result.items).toEqual(mockItems);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });
  });

  describe('getById', () => {
    it('should return item when found', async () => {
      const mockItem = { id: 'test-id', name: 'Test' };
      (prisma.${modelName}.findUnique as any).mockResolvedValue(mockItem);

      const result = await service.getById('test-id');

      expect(result).toEqual(mockItem);
    });

    it('should throw 404 when not found', async () => {
      (prisma.${modelName}.findUnique as any).mockResolvedValue(null);

      await expect(service.getById('missing-id')).rejects.toMatchObject({
        status: 404,
        code: 'NOT_FOUND',
      });
    });
  });
});
```

---

## Frontend Integration

### API Client
**Path:** `frontend/src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle API errors consistently
    const message = error.response?.data?.error?.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// ============================================
// ${EntityName} API
// ============================================

export interface ${EntityName} {
  id: string;
  // Add fields matching backend model
}

export interface ${EntityName}ListResponse {
  success: true;
  data: ${EntityName}[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ${EntityName}Response {
  success: true;
  data: ${EntityName};
}

export const ${entityName}Api = {
  /**
   * Get paginated list
   */
  list: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get<${EntityName}ListResponse>('/${entity}', { params });
    return response.data;
  },

  /**
   * Get by ID
   */
  getById: async (id: string) => {
    const response = await api.get<${EntityName}Response>(`/${entity}/${id}`);
    return response.data;
  },

  /**
   * Create new
   */
  create: async (data: Omit<${EntityName}, 'id'>) => {
    const response = await api.post<${EntityName}Response>('/${entity}', data);
    return response.data;
  },

  /**
   * Update
   */
  update: async (id: string, data: Partial<${EntityName}>) => {
    const response = await api.patch<${EntityName}Response>(`/${entity}/${id}`, data);
    return response.data;
  },

  /**
   * Delete
   */
  delete: async (id: string) => {
    await api.delete(`/${entity}/${id}`);
  },
};

export default api;
```

### React Query Hook
**Path:** `frontend/src/hooks/use${EntityName}.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ${entityName}Api, ${EntityName} } from '../services/api';

/**
 * Query key factory for ${entityName}
 */
export const ${entityName}Keys = {
  all: ['${entity}'] as const,
  lists: () => [...${entityName}Keys.all, 'list'] as const,
  list: (params: { page?: number; limit?: number }) =>
    [...${entityName}Keys.lists(), params] as const,
  details: () => [...${entityName}Keys.all, 'detail'] as const,
  detail: (id: string) => [...${entityName}Keys.details(), id] as const,
};

/**
 * Hook to fetch paginated ${entity} list
 * Per TECHNICAL_REQUIREMENTS.md: Uses TanStack Query for server state
 */
export function use${EntityName}List(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ${entityName}Keys.list(params || {}),
    queryFn: () => ${entityName}Api.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch single ${entity}
 */
export function use${EntityName}(id: string) {
  return useQuery({
    queryKey: ${entityName}Keys.detail(id),
    queryFn: () => ${entityName}Api.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create ${entity}
 */
export function useCreate${EntityName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<${EntityName}, 'id'>) => ${entityName}Api.create(data),
    onSuccess: () => {
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({ queryKey: ${entityName}Keys.lists() });
    },
  });
}

/**
 * Hook to update ${entity}
 */
export function useUpdate${EntityName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<${EntityName}> }) =>
      ${entityName}Api.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: ${entityName}Keys.lists() });
      queryClient.invalidateQueries({ queryKey: ${entityName}Keys.detail(id) });
    },
  });
}

/**
 * Hook to delete ${entity}
 */
export function useDelete${EntityName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ${entityName}Api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ${entityName}Keys.lists() });
    },
  });
}
```

---

## Testing the Endpoint

```bash
# Run backend tests
cd backend && npm test -- ${entity}

# Manual testing with curl

# GET list
curl "http://localhost:3001/api/${entity}?page=1&limit=10"

# GET by ID
curl "http://localhost:3001/api/${entity}/uuid-here"

# POST create
curl -X POST "http://localhost:3001/api/${entity}" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'

# PATCH update
curl -X PATCH "http://localhost:3001/api/${entity}/uuid-here" \
  -H "Content-Type: application/json" \
  -d '{"field": "new-value"}'

# DELETE
curl -X DELETE "http://localhost:3001/api/${entity}/uuid-here"
```

---

## Checklist Before PR

- [ ] Schema file created at `backend/src/schemas/${entity}.schemas.ts`
- [ ] Service file created at `backend/src/services/${entity}.service.ts`
- [ ] Controller file created at `backend/src/controllers/${entity}.controller.ts`
- [ ] Routes file created at `backend/src/routes/${entity}.routes.ts`
- [ ] Routes registered in `backend/src/app.ts`
- [ ] Route tests at `backend/tests/routes/${entity}.routes.test.ts`
- [ ] Service tests at `backend/tests/services/${entity}.service.test.ts`
- [ ] Frontend API client updated at `frontend/src/services/api.ts`
- [ ] React Query hook at `frontend/src/hooks/use${EntityName}.ts`
- [ ] TypeScript compiles: `cd backend && npm run build`
- [ ] All tests pass: `cd backend && npm test`
- [ ] Manual curl tests pass
- [ ] Response format matches TECHNICAL_REQUIREMENTS.md

---

## Commit Message

```
feat(api): add $0 $1 endpoint

- Implement ${entity} $0 endpoint at $1
- Add Zod schema validation
- Add comprehensive test coverage
- Add frontend API client and React Query hook
```
