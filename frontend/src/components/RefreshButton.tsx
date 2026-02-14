import { useRefresh } from "../hooks";

export function RefreshButton() {
  const { refresh, isRefreshing, status, lastRefreshResult } = useRefresh();

  // Format last refresh time
  const lastRefreshTime = status?.completedAt
    ? new Date(status.completedAt).toLocaleTimeString()
    : null;

  return (
    <div className="flex items-center gap-3">
      {lastRefreshTime && (
        <span
          className="hidden text-xs text-gray-500 sm:block"
          title={`Last refreshed at ${lastRefreshTime}`}
        >
          Updated {lastRefreshTime}
        </span>
      )}

      {lastRefreshResult && !isRefreshing && (
        <span className="hidden rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 sm:block">
          +{lastRefreshResult.data.articlesNew} new
        </span>
      )}

      <button
        onClick={() => refresh()}
        disabled={isRefreshing}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRefreshing ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Refreshing...</span>
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </>
        )}
      </button>
    </div>
  );
}
