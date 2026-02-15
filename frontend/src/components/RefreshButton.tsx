import { useRefresh } from "../hooks";

export function RefreshButton() {
  const { refresh, isRefreshing, status, lastRefreshResult } = useRefresh();

  const lastRefreshTime = status?.completedAt
    ? new Date(status.completedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex items-center gap-3">
      {/* Last Updated Time */}
      {lastRefreshTime && (
        <div
          className="hidden items-center gap-2 text-xs text-text-muted sm:flex"
          title={`Last refreshed at ${lastRefreshTime}`}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-mono">{lastRefreshTime}</span>
        </div>
      )}

      {/* New Articles Badge */}
      {lastRefreshResult &&
        !isRefreshing &&
        lastRefreshResult.data.articlesNew > 0 && (
          <span className="hidden items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success border border-success/20 sm:flex">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            {lastRefreshResult.data.articlesNew} new
          </span>
        )}

      {/* Refresh Button */}
      <button
        onClick={() => refresh()}
        disabled={isRefreshing}
        className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-surface transition-all duration-300 hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/25 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
      >
        {/* Animated background on hover */}
        <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

        {isRefreshing ? (
          <>
            <svg
              className="h-4 w-4 animate-spin-slow"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Syncing...</span>
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Sync</span>
          </>
        )}
      </button>
    </div>
  );
}
