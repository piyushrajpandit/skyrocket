import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-green-500/10 blur-3xl" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
          <span className="text-6xl font-black bg-gradient-to-b from-green-400 to-emerald-600 bg-clip-text text-transparent">
            404
          </span>
        </div>
      </div>

      <h1 className="text-3xl font-black text-[var(--foreground)] mb-2">
        Page not found
      </h1>
      <p className="text-sm text-[var(--muted)] max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 hover:brightness-110 transition-all"
        >
          Go Home
        </Link>
        <Link
          href="/agent"
          className="rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] px-6 py-3 text-sm font-medium text-[var(--foreground)] hover:border-green-400/30 transition-colors"
        >
          AI Agent
        </Link>
      </div>
    </div>
  );
}
