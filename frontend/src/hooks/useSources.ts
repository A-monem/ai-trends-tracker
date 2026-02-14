import { useQuery } from "@tanstack/react-query";
import { getSources } from "../services/api";

export function useSources() {
  return useQuery({
    queryKey: ["sources"],
    queryFn: getSources,
    staleTime: 1000 * 60 * 5, // 5 minutes - sources rarely change
  });
}
