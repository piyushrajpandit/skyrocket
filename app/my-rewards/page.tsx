"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { useFetch } from "@/hooks/useFetch";

interface PointsEntry {
  action: string;
  points: number;
  date: string;
}

export default function MyRewardsPage() {
  const { status } = useSession();

  const { data, loading } = useFetch<{ points: number; history: PointsEntry[] }>(
    status === "authenticated" ? "/api/user/points" : null
  );

  const points = data?.points ?? 0;
  const history = data?.history ?? [];

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google", { callbackUrl: "/my-rewards" });
    }
  }, [status]);

  if (status === "loading") {
    return (
      <>
        <Header />
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 animate-spin text-green-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[var(--muted)]">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">
            My Rewards
          </h1>

          {/* Points Balance Card */}
          <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-8 mb-8 text-center relative overflow-hidden">
            <div className="absolute top-4 right-4 text-5xl opacity-10">⭐</div>
            <p className="text-sm text-green-400/70 uppercase tracking-wider mb-2">
              Your Points Balance
            </p>
            {loading ? (
              <div className="h-14 w-32 mx-auto rounded bg-green-400/10 animate-pulse" />
            ) : (
              <p className="text-6xl font-extrabold text-green-400 tracking-tight">
                {points.toLocaleString("en-IN")}
              </p>
            )}
            <p className="text-sm text-[var(--muted)] mt-3">
              Earn points with every booking and referral
            </p>
          </div>

          {/* Earn & Redeem Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {/* How to Earn */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
                How to Earn
              </h2>
              <div className="space-y-3">
                {[
                  { icon: "✈️", label: "Every confirmed booking", pts: "+100" },
                  { icon: "👋", label: "Friend signs up with your code", pts: "+200" },
                  { icon: "🎉", label: "Friend's first booking", pts: "+500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm text-[var(--foreground)]">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-green-400">{item.pts}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Redeem */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
                Redeem Points
              </h2>
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-3 rounded-xl border border-green-400/20 bg-green-400/5 px-6 py-4 mb-4">
                  <span className="text-2xl font-bold text-green-400">500</span>
                  <span className="text-[var(--muted)]">=</span>
                  <span className="text-2xl font-bold text-[var(--foreground)]">₹100</span>
                  <span className="text-sm text-[var(--muted)]">off</span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Max 50% of ticket price redeemable per booking
                </p>
              </div>
              <Link
                href="/"
                className="block w-full text-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
              >
                Book a Flight to Redeem →
              </Link>
            </div>
          </div>

          {/* Refer CTA */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤝</span>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Invite friends & earn more!
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Get 200 points per signup + 500 per booking
                </p>
              </div>
            </div>
            <Link
              href="/refer"
              className="rounded-lg bg-blue-500/20 border border-blue-500/30 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              Refer Now
            </Link>
          </div>

          {/* Points History */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--card-border)]">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
                Points History
              </h2>
            </div>

            {loading ? (
              <div className="space-y-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
                    <div className="space-y-1">
                      <div className="h-3 w-40 rounded bg-[var(--card-border)]" />
                      <div className="h-2 w-24 rounded bg-[var(--card-border)]" />
                    </div>
                    <div className="h-4 w-14 rounded bg-[var(--card-border)]" />
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-3">⭐</div>
                <p className="text-[var(--muted)]">No points history yet</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Book a flight to start earning!
                </p>
              </div>
            ) : (
              <div>
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)] last:border-0"
                  >
                    <div>
                      <p className="text-sm text-[var(--foreground)]">
                        {entry.action}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(entry.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        entry.points > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {entry.points > 0 ? "+" : ""}
                      {entry.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
