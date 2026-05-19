"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Header from "../components/Header";

interface BookingRecord {
  _id: string;
  name: string;
  phone: string;
  email: string;
  flightId: string;
  flightName: string;
  price: number;
  seatPreference?: string;
  status: "pending" | "confirmed" | "cancelled";
  paymentId?: string;
  createdAt: string;
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google", { callbackUrl: "/my-bookings" });
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBookings();
    }
  }, [status]);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings/my");
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      } else {
        setError(data.error || "Failed to load bookings");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    setShowCancelModal(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();

      if (data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: "cancelled" } : b
          )
        );
        toast.success("🚫 Booking cancelled");
      } else {
        const msg = data.error || "Failed to cancel booking";
        setError(msg);
        toast.error(msg);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  if (status === "loading") {
    return (
      <>
        <Header />
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 animate-spin text-green-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-[var(--muted)]">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  const statusColors: Record<string, string> = {
    confirmed:
      "bg-green-400/10 text-green-400 border border-green-400/30",
    pending:
      "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30",
    cancelled: "bg-red-400/10 text-red-400 border border-red-400/30",
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                My Bookings
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                View all your flight bookings
              </p>
            </div>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-green-400/50 transition-all disabled:opacity-50"
              aria-label="Refresh bookings"
            >
              {loading ? "Loading..." : "🔄 Refresh"}
            </button>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              <p className="font-semibold mb-1">⚠️ Error</p>
              <p>{error}</p>
              <button
                onClick={() => setError("")}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-[var(--card-border)]" />
                      <div className="h-3 w-28 rounded bg-[var(--card-border)]" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-[var(--card-border)]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && bookings.length === 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                No bookings yet
              </h2>
              <p className="text-sm text-[var(--muted)] mb-6">
                Search and book a flight to see your bookings here.
              </p>
              <Link
                href="/"
                className="inline-block rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:brightness-110 transition-all"
              >
                Search Flights
              </Link>
            </div>
          )}

          {/* Bookings list */}
          {!loading && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((booking, i) => (
                <div
                  key={booking._id}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 sm:p-6 transition-all hover:border-green-400/20 slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Flight info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-[var(--foreground)]">
                          {booking.flightName}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusColors[booking.status] || statusColors.pending
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--muted)]">
                        <span>
                          🆔{" "}
                          <span className="font-mono text-xs">
                            {booking._id.slice(-8)}
                          </span>
                        </span>
                        {booking.seatPreference && (
                          <span>💺 {booking.seatPreference}</span>
                        )}
                        <span>
                          📅{" "}
                          {new Date(booking.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                        {booking.paymentId && (
                          <span className="text-green-400">💳 Paid</span>
                        )}
                      </div>
                    </div>

                    {/* Price + Cancel */}
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-green-400">
                        {booking.price === 0
                          ? "FREE"
                          : `₹${booking.price.toLocaleString("en-IN")}`}
                      </p>

                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => setShowCancelModal(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                          aria-label={`Cancel booking ${booking._id.slice(-8)}`}
                        >
                          {cancellingId === booking._id ? (
                            <span className="flex items-center gap-1.5">
                              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Cancelling...
                            </span>
                          ) : (
                            "✕ Cancel"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCancelModal(null)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-2xl shadow-black/40">
            <div className="text-center mb-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-2xl mb-3">
                ⚠️
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">
                Cancel Booking?
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              {bookings.find((b) => b._id === showCancelModal)?.paymentId && (
                <p className="mt-2 text-xs text-yellow-400">
                  💳 A refund will be initiated for the payment amount.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(null)}
                className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card-border)]/50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancelBooking(showCancelModal)}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
