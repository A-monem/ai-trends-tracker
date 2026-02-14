// Source types
export interface Source {
  id: string;
  name: string;
  slug: string;
  type: string;
  feedUrl: string | null;
  websiteUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  articleCount?: number;
}

// Article types
export interface Article {
  id: string;
  sourceId: string;
  title: string;
  url: string;
  summary: string | null;
  contentHash: string;
  publishedAt: string;
  fetchedAt: string;
  summarizedAt: string | null;
  createdAt: string;
  source: Source;
}

// Pagination types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// Refresh types
export interface RefreshStatus {
  id: string;
  sourceId: string | null;
  status: "pending" | "running" | "completed" | "failed";
  articlesFound: number;
  articlesNew: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface RefreshResult {
  success: boolean;
  data: {
    fetchId: string;
    sources: number;
    articlesFound: number;
    articlesNew: number;
    articlesSummarized: number;
  };
}

// Query params
export interface ArticleQueryParams {
  source?: string;
  page?: number;
  limit?: number;
}
