"use client";

import { useState } from "react";
import Link from "next/link";
import type { Flight } from "@/lib/flights";

/* ── Airline badge colors ── */
const airlineColors: Record<string, { bg: string; text: string; accent: string }> = {
  IndiGo: { bg: "bg-blue-500/10", text: "text-blue-400", accent: "border-blue-500/30" },
  "Air India": { bg: "bg-orange-500/10", text: "text-orange-400", accent: "border-orange-500/30" },
  SpiceJet: { bg: "bg-red-500/10", text: "text-red-400", accent: "border-red-500/30" },
  Vistara: { bg: "bg-purple-500/10", text: "text-purple-400", accent: "border-purple-500/30" },
};

export default function SearchSection() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<Flight[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    try {
      const res = await fetch("/api/flights");
      const data = await res.json();

      if (
        from.toLowerCase().includes("bangalore") &&
        to.toLowerCase().includes("patna")
      ) {
        setResults(data.data);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="search-section" className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Search Form */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 sm:p-8 glow-green-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Search Flights
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Find the best deals on domestic flights
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="search-from" className="mb-1.5 block text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  From
                </label>
                <input
                  id="search-from"
                  type="text"
                  placeholder="From (e.g. Bangalore)"
                  aria-label="Departure city"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="search-to" className="mb-1.5 block text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  To
                </label>
                <input
                  id="search-to"
                  type="text"
                  placeholder="To (e.g. Patna)"
                  aria-label="Arrival city"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="search-date" className="mb-1.5 block text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Date
                </label>
                <input
                  id="search-date"
                  type="date"
                  aria-label="Travel date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-colors"
                />
              </div>
            </div>

            <button
              id="search-flights-button"
              onClick={handleSearch}
              disabled={!from || !to || loading}
              aria-label="Search for flights"
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-green-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Searching flights...
                </span>
              ) : (
                "Search Flights"
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && !loading && (
          <div className="mx-auto mt-10 max-w-4xl">
            {results.length > 0 ? (
              <>
                <div className="mb-6 flex items-baseline justify-between">
                  <h2 className="text-xl font-bold">
                    {results.length} flights found
                  </h2>
                  <span className="text-sm text-[var(--muted)]">
                    Sorted by departure time
                  </span>
                </div>

                <div className="space-y-4">
                  {results.map((flight, i) => {
                    const colors = airlineColors[flight.airline] || {
                      bg: "bg-gray-500/10",
                      text: "text-gray-400",
                      accent: "border-gray-500/30",
                    };

                    return (
                      <div
                        key={flight.id}
                        className={`group rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 sm:p-6 transition-all hover:border-green-400/30 hover:glow-green-sm slide-up`}
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          {/* Airline info */}
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg} border ${colors.accent}`}
                            >
                              <span className={`text-lg font-bold ${colors.text}`}>
                                {flight.airline.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-[var(--foreground)]">
                                {flight.airline}
                              </h3>
                              <p className="text-xs text-[var(--muted)]">
                                {flight.flightNumber}
                              </p>
                            </div>
                          </div>

                          {/* Time & route */}
                          <div className="flex items-center gap-6 text-center">
                            <div>
                              <p className="text-xl font-bold text-[var(--foreground)]">
                                {flight.departure}
                              </p>
                              <p className="text-xs text-[var(--muted)]">{flight.from}</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-[var(--muted)]">
                                {flight.duration}
                              </span>
                              <div className="flex items-center gap-1">
                                <div className="h-px w-12 bg-[var(--muted)]/30" />
                                <span className="text-[var(--muted)]">—</span>
                                <div className="h-px w-12 bg-[var(--muted)]/30" />
                              </div>
                              <span className="text-xs text-green-400">
                                {flight.stops}
                              </span>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-[var(--foreground)]">
                                {flight.to}
                              </p>
                            </div>
                          </div>

                          {/* Price & CTA */}
                          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                            <p className="text-2xl font-bold text-green-400">
                              ₹{flight.price.toLocaleString("en-IN")}
                            </p>
                            <Link
                              href={`/book?flightId=${flight.id}`}
                              className="rounded-lg bg-green-500/10 border border-green-500/30 px-5 py-2.5 text-sm font-semibold text-green-400 transition-all hover:bg-green-500 hover:text-white hover:shadow-lg hover:shadow-green-500/25"
                              aria-label={`Book ${flight.airline} flight ${flight.flightNumber} for ${flight.price} rupees`}
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-10 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                  No flights found
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  Try searching Bangalore to{" "}
                  <span className="text-green-400 font-medium">Patna</span> for
                  demo results
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
