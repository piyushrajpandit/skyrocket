"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

interface BookingResult {
  _id: string; name: string; phone: string; email: string;
  flightId: string; flightName: string; price: number;
  seatPreference?: string; status: string; createdAt: string;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBooking(data.data);
        else setError("Booking not found");
      })
      .catch(() => setError("Failed to load booking"))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-green-400/30 border-t-green-400" />
          <p className="text-sm text-[var(--muted)]">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (!bookingId || error || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></svg>
        </div>
        <h1 className="text-xl font-semibold text-white">{error || "No booking found"}</h1>
        <Link href="/" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-green-400 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-green-300">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-[var(--muted)] transition-colors hover:text-white">
            <span className="text-sm">← Home</span>
          </Link>
          <div className="h-4 w-px bg-[var(--card-border)]" />
          <h1 className="text-sm font-semibold text-white">Booking Confirmed</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400/20 text-[10px] font-bold text-green-400">✓</div>
            <div className="h-px w-4 bg-green-400/30" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400/20 text-[10px] font-bold text-green-400">✓</div>
            <div className="h-px w-4 bg-green-400/30" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400 text-[10px] font-bold text-gray-900">✓</div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          {/* Success hero */}
          <div className="slide-up mb-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-400/10 glow-green">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Booking Confirmed!</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Your flight has been booked successfully</p>
          </div>

          {/* Booking ID */}
          <div className="slide-up mb-6 rounded-2xl border border-green-400/20 bg-green-400/5 p-4 text-center" style={{ animationDelay: "100ms" }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1">Booking ID</p>
            <p className="text-lg font-bold font-mono text-green-400 tracking-wider select-all">{booking._id}</p>
          </div>

          {/* Details card */}
          <div className="slide-up rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden" style={{ animationDelay: "200ms" }}>
            {/* Flight section */}
            <div className="p-6 border-b border-[var(--card-border)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">Flight Details</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-400/10 border border-green-400/20">
                  <span className="text-sm font-bold text-green-400">{booking.flightId.split("-")[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-white">{booking.flightName}</p>
                  <p className="text-xs text-[var(--muted)] font-mono">{booking.flightId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                <span className="text-[var(--muted)]">Status</span>
                <span className="text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-400/10 px-2.5 py-0.5 text-xs font-semibold text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </span>
                <span className="text-[var(--muted)]">Amount Paid</span>
                <span className="text-right text-green-400 font-bold">₹{booking.price.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Passenger section */}
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">Passenger Details</p>
              <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                <span className="text-[var(--muted)]">Name</span>
                <span className="text-white font-medium text-right">{booking.name}</span>
                <span className="text-[var(--muted)]">Email</span>
                <span className="text-white font-medium text-right truncate">{booking.email}</span>
                <span className="text-[var(--muted)]">Phone</span>
                <span className="text-white font-medium text-right">{booking.phone}</span>
                {booking.seatPreference && (
                  <>
                    <span className="text-[var(--muted)]">Seat</span>
                    <span className="text-white font-medium text-right">{booking.seatPreference}</span>
                  </>
                )}
                <span className="text-[var(--muted)]">Booked On</span>
                <span className="text-white font-medium text-right">{new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="slide-up mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center" style={{ animationDelay: "300ms" }}>
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-3 text-sm font-bold text-gray-900 transition-all hover:from-green-300 hover:to-emerald-400 hover:shadow-lg hover:shadow-green-400/25">
              Search More Flights
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-green-400/30 border-t-green-400" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
