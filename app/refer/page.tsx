"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import { useFetch } from "@/hooks/useFetch";

interface ReferralData {
  referralCode: string;
  referralCount: number;
  referralPoints: number;
}

export default function ReferPage() {
  const { status } = useSession();

  const { data, loading } = useFetch<ReferralData>(
    status === "authenticated" ? "/api/user/referral" : null
  );

  const referralCode = data?.referralCode ?? "";
  const referralCount = data?.referralCount ?? 0;
  const referralPoints = data?.referralPoints ?? 0;

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google", { callbackUrl: "/refer" });
    }
  }, [status]);

  const shareLink = `https://skymock.vercel.app/signup?ref=${referralCode}`;

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`📋 ${label} copied!`);
    } catch {
      toast.error("Failed to copy");
    }
  };

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
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Refer & Earn
          </h1>
          <p className="text-sm text-[var(--muted)] mb-8">
            Share your code with friends and earn loyalty points!
          </p>

          {/* Referral Code Card */}
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 mb-6 text-center relative overflow-hidden">
            <div className="absolute -top-6 -right-6 text-8xl opacity-[0.04]">🎁</div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-3">
              Your Referral Code
            </p>
            {loading ? (
              <div className="h-12 w-48 mx-auto rounded-lg bg-[var(--card-border)] animate-pulse" />
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-widest text-green-400 font-mono">
                  {referralCode}
                </span>
                <button
                  onClick={() => handleCopy(referralCode, "Code")}
                  className="rounded-lg bg-green-400/10 border border-green-400/30 px-3 py-2 text-green-400 hover:bg-green-400/20 transition-colors"
                  aria-label="Copy referral code"
                >
                  📋
                </button>
              </div>
            )}
          </div>

          {/* Shareable Link */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 mb-6">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">
              Shareable Link
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm text-[var(--muted)] font-mono truncate">
                {loading ? "..." : shareLink}
              </div>
              <button
                onClick={() => handleCopy(shareLink, "Link")}
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all disabled:opacity-50"
                aria-label="Copy referral link"
              >
                Copy Link
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 text-center">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">
                Successful Referrals
              </p>
              {loading ? (
                <div className="h-9 w-12 mx-auto rounded bg-[var(--card-border)] animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {referralCount}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 text-center">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">
                Points Earned
              </p>
              {loading ? (
                <div className="h-9 w-20 mx-auto rounded bg-[var(--card-border)] animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-green-400">
                  {referralPoints.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
            <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-5">
              How It Works
            </h2>
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  icon: "📤",
                  title: "Share your code",
                  desc: "Send your unique referral code to friends",
                },
                {
                  step: "2",
                  icon: "👋",
                  title: "Friend signs up",
                  desc: "They use your code when signing up — you earn 200 points",
                },
                {
                  step: "3",
                  icon: "✈️",
                  title: "Friend books a flight",
                  desc: "When they make their first booking — you earn 500 more points!",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-400/10 text-green-400 text-sm font-bold">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <span>{item.icon}</span> {item.title}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
