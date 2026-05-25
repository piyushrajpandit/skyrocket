"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-5xl">
          💥
        </div>
      </div>

      <h1 className="text-3xl font-black text-[var(--foreground)] mb-2">
        Something went wrong
      </h1>
      <p className="text-sm text-[var(--muted)] max-w-md mb-8">
        An unexpected error occurred. Don&apos;t worry — your data is safe.
        Try again or go back to the homepage.
      </p>

      {error?.message && process.env.NODE_ENV !== "production" && (
        <pre className="mb-6 max-w-lg rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400 overflow-auto text-left">
          {error.message}
        </pre>
      )}

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 hover:brightness-110 transition-all"
        >
          Try Again
        </button>
        <a
          href="/"
          className="rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] px-6 py-3 text-sm font-medium text-[var(--foreground)] hover:border-green-400/30 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
