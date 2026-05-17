"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BookingData {
  name: string;
  phone: string;
  email: string;
  seatPreference: string;
  flightId: string;
  flightName: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departure: string;
  duration: string;
  price: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("skymock_booking");
    if (stored) {
      setBooking(JSON.parse(stored));
    }
  }, []);

  const handleCouponChange = (value: string) => {
    setCoupon(value);
    setCouponApplied(value.toUpperCase() === "HACKATHON2026");
    setError("");
  };

  const handleConfirm = async () => {
    if (!booking || !couponApplied) return;

    setConfirming(true);
    setError("");
    setConfirmStatus("Saving booking to database...");

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

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to save booking. Please try again.");
        setConfirming(false);
        setConfirmStatus("");
        return;
      }

      setConfirmStatus("Sending WhatsApp confirmation...");

      // Small delay to show the WhatsApp status text
      await new Promise((r) => setTimeout(r, 1500));

      // Clear localStorage
      localStorage.removeItem("skymock_booking");

      // Navigate to confirmation
      router.push(`/confirmation?bookingId=${data.data._id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error. Please check your connection and try again.";
      setError(message);
      setConfirming(false);
      setConfirmStatus("");
    }
  };

  if (!booking) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">💳</div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          No booking data found
        </h1>
        <p className="text-[var(--muted)] mb-6">
          Please complete the passenger details first.
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2 text-sm">
        {[
          { num: 1, label: "Search", done: true },
          { num: 2, label: "Details", done: true },
          { num: 3, label: "Payment", active: true },
        ].map((step, i) => (
          <div key={step.num} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step.done
                  ? "bg-green-500 text-white"
                  : step.active
                  ? "bg-green-400/20 text-green-400 border border-green-400/50"
                  : "bg-[var(--card-bg)] text-[var(--muted)] border border-[var(--card-border)]"
              }`}
            >
              {step.done ? "✓" : step.num}
            </div>
            <span
              className={`hidden sm:inline ${
                step.active ? "text-green-400 font-medium" : "text-[var(--muted)]"
              }`}
            >
              {step.label}
            </span>
            {i < 2 && (
              <div className="mx-2 h-px w-8 bg-[var(--card-border)]" />
            )}
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">
        Payment
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Flight + Passenger summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Flight Details */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
                Flight Details
              </h2>
              <p className="text-lg font-bold text-[var(--foreground)]">
                {booking.airline}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {booking.flightNumber}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">
                    {booking.departure}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{booking.from}</p>
                </div>
                <div className="text-center text-xs text-[var(--muted)]">
                  {booking.duration}
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--muted)]">{booking.to}</p>
                </div>
              </div>
            </div>

            {/* Passenger */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                Passenger
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
                  <span className="text-[var(--foreground)]">
                    {booking.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Email</span>
                  <span className="text-[var(--foreground)] text-xs">
                    {booking.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Seat</span>
                  <span className="text-[var(--foreground)]">
                    {booking.seatPreference}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment section */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-6">
              Payment Summary
            </h2>

            {/* Price breakdown */}
            <div className="space-y-3 border-b border-[var(--card-border)] pb-6 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Base fare</span>
                <span className="text-[var(--foreground)]">
                  ₹{booking.price.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Taxes & fees</span>
                <span className="text-[var(--foreground)]">₹0</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Coupon discount</span>
                  <span className="text-green-400 font-semibold">
                    -₹{booking.price.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-3 border-t border-[var(--card-border)]">
                <span className="text-[var(--foreground)]">Total</span>
                <span className={couponApplied ? "text-green-400" : "text-[var(--foreground)]"}>
                  {couponApplied
                    ? "FREE ✨"
                    : `₹${booking.price.toLocaleString("en-IN")}`}
                </span>
              </div>
            </div>

            {/* Coupon section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                Have a Coupon?
              </h3>
              <p className="text-xs text-[var(--muted)] mb-3">
                Enter your promo code to get a discount
              </p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    id="coupon-code-input"
                    type="text"
                    placeholder="Enter coupon code e.g. HACKATHON2026"
                    aria-label="Coupon code input field"
                    value={coupon}
                    onChange={(e) => handleCouponChange(e.target.value)}
                    disabled={confirming}
                    className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-colors uppercase tracking-wider pr-10"
                  />
                  {couponApplied && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-lg" aria-label="Coupon applied successfully">
                      ✓
                    </span>
                  )}
                </div>
              </div>
              {couponApplied && (
                <p className="mt-2 text-sm text-green-400 font-medium flex items-center gap-1.5">
                  <span>✓</span> Free! Payment waived
                </p>
              )}
              {coupon && !couponApplied && (
                <p className="mt-2 text-sm text-red-400">
                  Invalid coupon code
                </p>
              )}
            </div>

            {/* Error message (Task 3) */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                <p className="font-semibold mb-1">⚠️ Booking Error</p>
                <p>{error}</p>
              </div>
            )}

            {/* Status text while confirming (Task 2) */}
            {confirming && confirmStatus && (
              <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400 flex items-center gap-3">
                <svg className="h-4 w-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{confirmStatus}</span>
              </div>
            )}

            {/* Confirm / Pay buttons */}
            {couponApplied ? (
              <button
                id="confirm-booking-button"
                onClick={handleConfirm}
                disabled={confirming}
                aria-label="Confirm booking with coupon applied"
                className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {confirming ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Confirming Booking...
                  </>
                ) : (
                  "✅ Confirm Booking — FREE"
                )}
              </button>
            ) : (
              <button
                disabled
                aria-label="Payment disabled, enter a valid coupon code first"
                className="w-full rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-6 py-3.5 text-sm font-semibold text-[var(--muted)] cursor-not-allowed"
              >
                Pay ₹{booking.price.toLocaleString("en-IN")} (Disabled — Enter
                Coupon)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
