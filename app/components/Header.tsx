"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

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
          {session && (
            <Link
              href="/my-bookings"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-green-400"
            >
              My Bookings
            </Link>
          )}
          {session && (
            <Link
              href="/my-rewards"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-green-400"
            >
              Rewards
            </Link>
          )}
          {session && (
            <Link
              href="/refer"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-green-400"
            >
              Refer
            </Link>
          )}
          <Link
            href="/admin"
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-green-400"
          >
            Admin
          </Link>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full bg-green-400/10 px-3 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 pulse-dot" />
            <span className="text-xs font-medium text-green-400">
              Live Prices
            </span>
          </div>

          {status === "loading" && (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]" />
          )}

          {status === "unauthenticated" && (
            <button
              onClick={() => signIn("google")}
              aria-label="Login with Google"
              className="flex items-center gap-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-2 text-sm font-medium transition-all hover:border-green-400/50 hover:bg-green-400/5"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Login with Google
            </button>
          )}

          {status === "authenticated" && session?.user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-3 py-1.5 transition-all hover:border-green-400/50"
                aria-label="User menu"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-400/20 text-xs font-bold text-green-400">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                )}
                <span className="hidden text-sm font-medium text-[var(--foreground)] sm:inline max-w-[120px] truncate">
                  {session.user.name}
                </span>
                <svg
                  className={`h-3.5 w-3.5 text-[var(--muted)] transition-transform ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-2 shadow-xl shadow-black/20 backdrop-blur-xl">
                    <div className="border-b border-[var(--card-border)] px-3 py-2 mb-1">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-[var(--muted)] truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/my-bookings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-green-400/10 transition-colors"
                    >
                      <span>📋</span> My Bookings
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-green-400/10 transition-colors"
                    >
                      <span>⚙️</span> Admin Dashboard
                    </Link>
                    <div className="border-t border-[var(--card-border)] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          signOut();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                        aria-label="Sign out"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
