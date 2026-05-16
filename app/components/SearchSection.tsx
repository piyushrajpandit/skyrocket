"use client";

import { useState } from "react";
import Link from "next/link";
import type { Flight } from "@/lib/flights";

/* ── Airline badge colors ── */
const airlineColors: Record<string, { bg: string; text: string; accent: string }> = {
  IndiGo: { bg: "bg-blue-500/10", text: "text-blue-400", accent: "border-blue-500/30" },
  "Air India": { bg: "bg-red-500/10", text: "text-red-400", accent: "border-red-500/30" },
  SpiceJet: { bg: "bg-yellow-500/10", text: "text-yellow-400", accent: "border-yellow-500/30" },
  Vistara: { bg: "bg-purple-500/10", text: "text-purple-400", accent: "border-purple-500/30" },
};

function FlightCard({ flight, index }: { flight: Flight; index: number }) {
  const colors = airlineColors[flight.airline] ?? {
    bg: "bg-green-500/10",
    text: "text-green-400",
    accent: "border-green-500/30",
  };

  return (
    <div
      className="slide-up group relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 transition-all duration-300 hover:border-green-400/30 hover:bg-[#13131d]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Glow effect on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-green-400/5 via-transparent to-transparent" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Airline info */}
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg} border ${colors.accent}`}
          >
            <span className={`text-sm font-bold ${colors.text}`}>
              {flight.logo}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{flight.airline}</h3>
            <p className="text-xs text-[var(--muted)] font-mono">
              {flight.flightNumber}
            </p>
          </div>
        </div>

        {/* Time & Route */}
        <div className="flex items-center gap-6 text-center">
          <div>
            <p className="text-lg font-semibold text-white">{flight.departure}</p>
            <p className="text-xs text-[var(--muted)]">{flight.from}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider">
              {flight.duration}
            </span>
            <div className="flex items-center gap-1">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-green-400/60 to-transparent sm:w-20" />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-green-400"
              >
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
              </svg>
            </div>
            <span className="text-[10px] text-green-400/70 font-medium">
              {flight.stops}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">—</p>
            <p className="text-xs text-[var(--muted)]">{flight.to}</p>
          </div>
        </div>

        {/* Price & Book */}
        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <p className="text-2xl font-bold text-green-400">
            ₹{flight.price.toLocaleString("en-IN")}
          </p>
          <Link
            href={`/book?flightId=${flight.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-green-400 px-5 py-2.5 text-sm font-semibold text-gray-900 transition-all duration-200 hover:bg-green-300 hover:shadow-lg hover:shadow-green-400/25 active:scale-[0.97]"
          >
            Book Now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SearchSection() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<Flight[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(false);

    // Simulate loading
    await new Promise((r) => setTimeout(r, 800));

    const fromLower = from.toLowerCase().trim();
    const toLower = to.toLowerCase().trim();

    if (
      (fromLower.includes("bangalore") || fromLower.includes("bengaluru")) &&
      toLower.includes("patna")
    ) {
      const res = await fetch("/api/flights");
      const data = await res.json();
      setResults(data.data);
    } else {
      setResults([]);
    }

    setSearched(true);
    setLoading(false);
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      {/* Search form */}
      <form
        onSubmit={handleSearch}
        className="glow-green relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 sm:p-8"
      >
        {/* Decorative corner */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-400/5 blur-3xl" />

        <div className="relative grid gap-4 sm:grid-cols-3 sm:gap-6">
          {/* From */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                <circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
              </svg>
              From
            </label>
            <input
              type="text"
              placeholder="e.g. Bangalore"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-white placeholder-[var(--muted)]/50 outline-none transition-all focus:border-green-400/50 focus:ring-2 focus:ring-green-400/10"
              required
            />
          </div>

          {/* To */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
              To
            </label>
            <input
              type="text"
              placeholder="e.g. Patna"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-white placeholder-[var(--muted)]/50 outline-none transition-all focus:border-green-400/50 focus:ring-2 focus:ring-green-400/10"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                <rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-white outline-none transition-all focus:border-green-400/50 focus:ring-2 focus:ring-green-400/10 [color-scheme:dark]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-3.5 text-sm font-bold text-gray-900 transition-all duration-200 hover:from-green-300 hover:to-emerald-400 hover:shadow-lg hover:shadow-green-400/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed sm:w-auto sm:ml-auto"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              Searching...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              Search Flights
            </>
          )}
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div className="mt-8 space-y-4">
          {results.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {results.length} flights found
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  Sorted by departure time
                </p>
              </div>
              <div className="space-y-3">
                {results.map((flight, idx) => (
                  <FlightCard key={flight.id} flight={flight} index={idx} />
                ))}
              </div>
            </>
          ) : (
            <div className="slide-up rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--input-bg)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted)]">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">
                No flights found
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Try searching <span className="text-green-400 font-medium">Bangalore</span> to{" "}
                <span className="text-green-400 font-medium">Patna</span> for demo results
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
