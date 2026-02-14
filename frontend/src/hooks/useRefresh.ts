import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { triggerRefresh, getRefreshStatus } from "../services/api";

export function useRefresh() {
  const queryClient = useQueryClient();

  // Query for refresh status
  const statusQuery = useQuery({
    queryKey: ["refreshStatus"],
    queryFn: getRefreshStatus,
    refetchInterval: (query) => {
      // Poll every 2 seconds while status is 'running'
      const status = query.state.data?.data?.status;
      return status === "running" ? 2000 : false;
    },
  });

  // Mutation for triggering refresh
  const refreshMutation = useMutation({
    mutationFn: triggerRefresh,
    onSuccess: () => {
      // Invalidate articles and status queries on success
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["refreshStatus"] });
    },
  });

  return {
    refresh: refreshMutation.mutate,
    isRefreshing:
      refreshMutation.isPending || statusQuery.data?.data?.status === "running",
    status: statusQuery.data?.data,
    error: refreshMutation.error,
    lastRefreshResult: refreshMutation.data,
  };
}
