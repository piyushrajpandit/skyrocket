"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

interface BookingResult {
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

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId || bookingId === "test") {
        setError("No valid booking ID provided. Please complete a booking first.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = await res.json();

        if (data.success) {
          setBooking(data.data);
        } else {
          setError(data.error || "Booking not found");
        }
      } catch {
        setError("Failed to load booking details. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 animate-spin text-green-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-[var(--muted)]">Loading booking...</span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          {error || "No booking found"}
        </h1>
        <p className="text-[var(--muted)] mb-6 max-w-md text-center">
          The booking ID may be invalid or the booking hasn&apos;t been created yet. Please try again.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
          aria-label="Go back to search flights"
        >
          Search Flights
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-4xl mb-4">
          🎉
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-[var(--muted)]">
          Your flight has been booked successfully
        </p>
      </div>

      {/* Booking ID */}
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 mb-6 text-center">
        <p className="text-xs text-green-400/70 uppercase tracking-wider mb-1">
          Booking ID
        </p>
        <p className="text-lg font-mono font-bold text-green-400">
          {booking._id}
        </p>
      </div>

      {/* Details */}
      <div className="space-y-4">
        {/* Flight Details */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
          <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
            Flight Details
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Flight</span>
              <span className="text-[var(--foreground)] font-medium">
                {booking.flightName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Flight ID</span>
              <span className="text-[var(--foreground)]">{booking.flightId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Price</span>
              <span className="text-green-400 font-semibold">
                {booking.price === 0
                  ? "FREE"
                  : `₹${booking.price.toLocaleString("en-IN")}`}
              </span>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
          <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
            Passenger Details
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Name</span>
              <span className="text-[var(--foreground)] font-medium">
                {booking.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Phone</span>
              <span className="text-[var(--foreground)]">{booking.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Email</span>
              <span className="text-[var(--foreground)]">{booking.email}</span>
            </div>
            {booking.seatPreference && (
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Seat</span>
                <span className="text-[var(--foreground)]">
                  {booking.seatPreference}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Status</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  booking.status === "confirmed"
                    ? "bg-green-400/10 text-green-400"
                    : "bg-yellow-400/10 text-yellow-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    booking.status === "confirmed"
                      ? "bg-green-400"
                      : "bg-yellow-400"
                  }`}
                />
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp notice */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 text-center">
          <p className="text-sm text-[var(--muted)]">
            📱 A WhatsApp confirmation has been sent to{" "}
            <span className="text-[var(--foreground)] font-medium">
              {booking.phone}
            </span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="flex-1 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-6 py-3 text-sm font-medium text-[var(--foreground)] text-center hover:border-green-400/30 transition-colors"
          aria-label="Go back to homepage"
        >
          Back to Home
        </Link>
        <Link
          href="/admin"
          className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white text-center shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
          aria-label="View all bookings on admin dashboard"
        >
          View Admin Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 animate-spin text-green-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[var(--muted)]">Loading confirmation...</span>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
