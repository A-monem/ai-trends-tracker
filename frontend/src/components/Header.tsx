import { RefreshButton } from "./RefreshButton";

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            {/* Animated Logo Mark */}
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-amber-600 shadow-lg shadow-accent/25">
                <svg
                  className="h-6 w-6 text-surface"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>

            {/* Brand Text */}
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary">
                AI <span className="text-accent">Trends</span>
              </h1>
              <p className="hidden text-xs font-medium tracking-widest uppercase text-text-muted sm:block">
                Intelligence Curated Daily
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="hidden items-center gap-2 rounded-full bg-surface-elevated px-3 py-1.5 border border-border sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-xs font-medium text-text-secondary">
                Live
              </span>
            </div>

            <RefreshButton />
          </div>
        </div>
      </div>

      {/* Decorative bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
    </header>
  );
}
