import axios, { AxiosError } from "axios";
import type {
  Article,
  Source,
  PaginatedResponse,
  ApiResponse,
  RefreshResult,
  RefreshStatus,
  ArticleQueryParams,
} from "../types";

// Create axios instance with base URL from environment
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Extract error message from response or use default
    const message =
      (error.response?.data as { error?: { message?: string } })?.error
        ?.message ||
      error.message ||
      "An unexpected error occurred";

    console.error("API Error:", message);
    return Promise.reject(new Error(message));
  },
);

// Articles API
export async function getArticles(
  params: ArticleQueryParams = {},
): Promise<PaginatedResponse<Article>> {
  const { data } = await api.get<PaginatedResponse<Article>>("/articles", {
    params,
  });
  return data;
}

export async function getArticle(id: string): Promise<ApiResponse<Article>> {
  const { data } = await api.get<ApiResponse<Article>>(`/articles/${id}`);
  return data;
}

// Sources API
export async function getSources(): Promise<ApiResponse<Source[]>> {
  const { data } = await api.get<ApiResponse<Source[]>>("/sources");
  return data;
}

// Refresh API
export async function triggerRefresh(): Promise<RefreshResult> {
  const { data } = await api.post<RefreshResult>("/refresh");
  return data;
}

export async function getRefreshStatus(): Promise<ApiResponse<RefreshStatus>> {
  const { data } = await api.get<ApiResponse<RefreshStatus>>("/refresh/status");
  return data;
}

export default api;
