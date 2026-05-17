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

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();

      if (data.success) {
        setBookings(data.data);
      } else {
        setError(data.error || "Failed to load bookings");
      }
    } catch {
      setError("Failed to connect to database. Check your MongoDB connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Monitor all SkyMock bookings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              fetchBookings();
            }}
            aria-label="Refresh bookings table"
            className="rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-green-400/30 transition-colors"
          >
            🔄 Refresh
          </button>
          <Link
            href="/"
            className="rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-green-400/30 transition-colors"
            aria-label="Go back to homepage"
          >
            ← Home
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{bookings.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider">Confirmed</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {bookings.filter((b) => b.status === "confirmed").length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">
            {bookings.filter((b) => b.status === "pending").length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider">Revenue</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
            ₹{bookings.reduce((sum, b) => sum + b.price, 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <svg className="h-5 w-5 animate-spin text-green-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[var(--muted)]">Loading bookings...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-400 font-medium mb-2">{error}</p>
            <p className="text-xs text-[var(--muted)]">
              Check your MONGODB_URI in .env.local
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-[var(--muted)]">No bookings yet</p>
            <p className="text-xs text-[var(--muted)] mt-1">
              Bookings will appear here after passengers confirm
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Bookings table">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-[var(--input-bg)]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Flight
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Seat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b._id}
                    className="border-b border-[var(--card-border)] hover:bg-[var(--input-bg)]/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                      {b._id.slice(-8)}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                      {b.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{b.phone}</td>
                    <td className="px-4 py-3 text-[var(--foreground)]">
                      {b.flightName}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {b.seatPreference || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          b.status === "confirmed"
                            ? "bg-green-400/10 text-green-400"
                            : "bg-yellow-400/10 text-yellow-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            b.status === "confirmed"
                              ? "bg-green-400"
                              : "bg-yellow-400"
                          }`}
                        />
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">
                      {new Date(b.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
