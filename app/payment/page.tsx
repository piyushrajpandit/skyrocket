"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BookingData {
  name: string; phone: string; email: string; seatPreference: string;
  flightId: string; flightName: string; airline: string; flightNumber: string;
  from: string; to: string; departure: string; duration: string;
  price: number; logo: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("skymock_booking");
    if (stored) {
      setBooking(JSON.parse(stored));
    }
  }, []);

  const isFree = couponApplied && coupon.trim().toUpperCase() === "HACKATHON2026";

  const handleCouponApply = () => {
    if (coupon.trim().toUpperCase() === "HACKATHON2026") {
      setCouponApplied(true);
    } else {
      setCouponApplied(false);
      setError("Invalid coupon code");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleConfirm = async () => {
    if (!booking || !isFree) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: booking.name,
          phone: booking.phone,
          email: booking.email,
          flightId: booking.flightId,
          flightName: booking.flightName,
          price: booking.price,
          seatPreference: booking.seatPreference,
          status: "confirmed",
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem("skymock_booking");
        router.push(`/confirmation?bookingId=${data.data._id}`);
      } else {
        setError(data.error || "Booking failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></svg>
        </div>
        <h1 className="text-xl font-semibold text-white">No booking data found</h1>
        <p className="text-sm text-[var(--muted)]">Please complete the passenger details first.</p>
        <Link href="/" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-green-400 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-green-300">← Back to Search</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-4 sm:px-6">
          <Link href={`/book?flightId=${booking.flightId}`} className="flex items-center gap-2 text-[var(--muted)] transition-colors hover:text-white">
            <span className="text-sm">← Back</span>
          </Link>
          <div className="h-4 w-px bg-[var(--card-border)]" />
          <h1 className="text-sm font-semibold text-white">Payment</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400/20 text-[10px] font-bold text-green-400">✓</div>
            <div className="h-px w-4 bg-green-400/30" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400 text-[10px] font-bold text-gray-900">2</div>
            <div className="h-px w-4 bg-[var(--card-border)]" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--card-border)] text-[10px] font-bold text-[var(--muted)]">3</div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Booking Summary sidebar */}
            <div className="lg:col-span-2 lg:order-2 space-y-4">
              {/* Flight card */}
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Flight Details</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-400/10 border border-green-400/20">
                    <span className="text-xs font-bold text-green-400">{booking.logo}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{booking.airline}</p>
                    <p className="text-xs text-[var(--muted)] font-mono">{booking.flightNumber}</p>
                  </div>
                </div>
                <div className="h-px bg-[var(--card-border)] mb-3" />
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-[var(--muted)]">Route</span>
                  <span className="text-white font-medium text-right">{booking.from} → {booking.to}</span>
                  <span className="text-[var(--muted)]">Departure</span>
                  <span className="text-white font-medium text-right">{booking.departure}</span>
                  <span className="text-[var(--muted)]">Duration</span>
                  <span className="text-white font-medium text-right">{booking.duration}</span>
                </div>
              </div>

              {/* Passenger card */}
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Passenger</p>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-[var(--muted)]">Name</span>
                  <span className="text-white font-medium text-right">{booking.name}</span>
                  <span className="text-[var(--muted)]">Email</span>
                  <span className="text-white font-medium text-right truncate">{booking.email}</span>
                  <span className="text-[var(--muted)]">Phone</span>
                  <span className="text-white font-medium text-right">{booking.phone}</span>
                  <span className="text-[var(--muted)]">Seat</span>
                  <span className="text-white font-medium text-right">{booking.seatPreference}</span>
                </div>
              </div>
            </div>

            {/* Payment section */}
            <div className="lg:col-span-3 lg:order-1 space-y-4">
              {/* Price breakdown */}
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-white">Payment Summary</h2>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted)]">Base Fare</span>
                    <span className="text-white font-medium">₹{booking.price.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted)]">Taxes & Fees</span>
                    <span className="text-white font-medium">₹0</span>
                  </div>
                  {isFree && (
                    <div className="flex items-center justify-between text-sm slide-up">
                      <span className="text-green-400 font-medium">Coupon Discount</span>
                      <span className="text-green-400 font-bold">- ₹{booking.price.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="h-px bg-[var(--card-border)]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Total</span>
                    <span className={`text-2xl font-bold ${isFree ? "text-green-400" : "text-white"}`}>
                      {isFree ? "₹0" : `₹${booking.price.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coupon section */}
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 sm:p-8">
                <h3 className="text-sm font-semibold text-white mb-1">Have a Coupon?</h3>
                <p className="text-xs text-[var(--muted)] mb-4">Enter your promo code to get a discount</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value); setCouponApplied(false); }}
                    className="flex-1 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-white placeholder-[var(--muted)]/50 outline-none transition-all focus:border-green-400/50 focus:ring-2 focus:ring-green-400/10 uppercase font-mono tracking-wider"
                  />
                  <button type="button" onClick={handleCouponApply}
                    className="rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] px-5 py-3 text-sm font-semibold text-white transition-all hover:border-green-400/30 hover:bg-green-400/5">
                    Apply
                  </button>
                </div>

                {isFree && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/5 px-4 py-3 slide-up">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
                    <span className="text-sm font-semibold text-green-400">Free! Payment waived</span>
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {isFree ? (
                <button onClick={handleConfirm} disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-4 text-sm font-bold text-gray-900 transition-all duration-200 hover:from-green-300 hover:to-emerald-400 hover:shadow-lg hover:shadow-green-400/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-900/30 border-t-gray-900" /> Processing...</>
                  ) : (
                    <>✓ Confirm Booking</>
                  )}
                </button>
              ) : (
                <button disabled
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] px-6 py-4 text-sm font-bold text-[var(--muted)] cursor-not-allowed opacity-60">
                  Pay ₹{booking.price.toLocaleString("en-IN")}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
