import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/20 transition-shadow group-hover:shadow-green-500/40">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">
            Sky<span className="text-green-400">Mock</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-green-400"
          >
            Flights
          </Link>
          <span className="text-sm font-medium text-[var(--muted)]/50 cursor-not-allowed">
            Hotels
          </span>
          <span className="text-sm font-medium text-[var(--muted)]/50 cursor-not-allowed">
            Packages
          </span>
          <Link
            href="/admin"
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-green-400"
          >
            Admin
          </Link>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full bg-green-400/10 px-3 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 pulse-dot" />
            <span className="text-xs font-medium text-green-400">Live Prices</span>
          </div>
          <button className="rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-2 text-sm font-medium transition-all hover:border-green-400/50 hover:bg-green-400/5">
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
}
