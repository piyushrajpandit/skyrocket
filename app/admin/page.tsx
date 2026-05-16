"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BookingRecord {
  _id: string;
  name: string;
  phone: string;
  email: string;
  flightId: string;
  flightName: string;
  price: number;
  seatPreference?: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBookings(data.data);
        else setError("Failed to load bookings");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-[var(--muted)] transition-colors hover:text-white">
            <span className="text-sm">← Home</span>
          </Link>
          <div className="h-4 w-px bg-[var(--card-border)]" />
          <h1 className="text-sm font-semibold text-white">Admin Dashboard</h1>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-green-400/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 pulse-dot" />
            <span className="text-xs font-medium text-green-400">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-green-400/30 border-t-green-400" />
              <p className="text-sm text-[var(--muted)]">Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></svg>
              </div>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--input-bg)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted)]"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
              </div>
              <p className="text-sm text-[var(--muted)]">No bookings yet</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--card-border)] bg-[var(--input-bg)]">
                      <th className="whitespace-nowrap px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Booking ID</th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Name</th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Phone</th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Flight</th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Seat</th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Status</th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {bookings.map((b) => (
                      <tr key={b._id} className="transition-colors hover:bg-[var(--input-bg)]/50">
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="font-mono text-xs text-green-400">{b._id.slice(-8)}</span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-white">{b.name}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-[var(--muted)]">{b.phone}</td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="text-white">{b.flightName}</span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-[var(--muted)]">{b.seatPreference || "—"}</td>
                        <td className="whitespace-nowrap px-5 py-4">
                          {b.status === "confirmed" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-400/10 px-2.5 py-1 text-[11px] font-semibold text-green-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                              Confirmed
                            </span>
                          ) : b.status === "pending" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-2.5 py-1 text-[11px] font-semibold text-yellow-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-400/10 px-2.5 py-1 text-[11px] font-semibold text-red-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                              {b.status}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--muted)]">
                          {new Date(b.createdAt).toLocaleString("en-IN", {
                            day: "numeric", month: "short",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
