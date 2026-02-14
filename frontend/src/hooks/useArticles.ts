import { useQuery } from "@tanstack/react-query";
import { getArticles, getArticle } from "../services/api";
import type { ArticleQueryParams } from "../types";

export function useArticles(params: ArticleQueryParams = {}) {
  return useQuery({
    queryKey: ["articles", params],
    queryFn: () => getArticles(params),
  });
}

export function useArticle(id: string | null) {
  return useQuery({
    queryKey: ["article", id],
    queryFn: () => getArticle(id!),
    enabled: !!id,
  });
}
