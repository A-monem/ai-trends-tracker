import { z } from "zod";

// ============================================
// Query Parameter Schemas
// ============================================

export const ArticleQuerySchema = z.object({
  source: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["publishedAt", "fetchedAt"]).default("publishedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const ArticleIdSchema = z.object({
  id: z.string().uuid(),
});

export const SummarizeQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional(),
});

// ============================================
// Response Schemas (for documentation/typing)
// ============================================

export const SourceResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  type: z.string(),
  websiteUrl: z.string().url(),
  isActive: z.boolean(),
  articleCount: z.number().optional(),
});

export const ArticleResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  url: z.string().url(),
  summary: z.string().nullable(),
  publishedAt: z.string().datetime(),
  fetchedAt: z.string().datetime(),
  summarizedAt: z.string().datetime().nullable(),
  source: SourceResponseSchema.pick({
    id: true,
    name: true,
    slug: true,
    websiteUrl: true,
  }),
});

export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const ApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiPaginatedSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(dataSchema),
    pagination: PaginationSchema,
  });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum(["VALIDATION_ERROR", "NOT_FOUND", "INTERNAL_ERROR"]),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

// ============================================
// Inferred Types
// ============================================

export type ArticleQuery = z.infer<typeof ArticleQuerySchema>;
export type ArticleId = z.infer<typeof ArticleIdSchema>;
export type SummarizeQuery = z.infer<typeof SummarizeQuerySchema>;
export type SourceResponse = z.infer<typeof SourceResponseSchema>;
export type ArticleResponse = z.infer<typeof ArticleResponseSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
