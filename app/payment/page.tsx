"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Script from "next/script";
import toast from "react-hot-toast";
import { useFetch } from "@/hooks/useFetch";

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

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { status } = useSession();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState("");
  const [error, setError] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Points state
  const [pointsBalance, setPointsBalance] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsLoading, setPointsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google", { callbackUrl: "/payment" });
    }
  }, [status]);

  useEffect(() => {
    const stored = localStorage.getItem("skymock_booking");
    if (stored) {
      setBooking(JSON.parse(stored));
    }
  }, []);

  // Points fetch using hook
  const { data: pointsData, loading: pointsFetchLoading } = useFetch<{ points: number }>(
    status === "authenticated" ? "/api/user/points" : null
  );

  useEffect(() => {
    if (pointsData) {
      setPointsBalance(pointsData.points);
      setPointsLoading(false);
    }
  }, [pointsData]);


  // Compute points discount
  const maxPointsDiscount = booking
    ? Math.floor(booking.price * 0.5)
    : 0;
  const rawPointsDiscount = Math.floor(pointsBalance / 500) * 100;
  const pointsDiscount = usePoints && !couponApplied
    ? Math.min(rawPointsDiscount, maxPointsDiscount)
    : 0;
  const pointsToUse = Math.ceil(pointsDiscount / 100) * 500;
  const finalPrice = booking
    ? couponApplied
      ? 0
      : Math.max(0, booking.price - pointsDiscount)
    : 0;

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 animate-spin text-green-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-[var(--muted)]">Checking authentication...</span>
        </div>
      </div>
    );
  }

  const handleCouponChange = (value: string) => {
    setCoupon(value);
    const applied = value.toUpperCase() === "HACKATHON2026";
    setCouponApplied(applied);
    if (applied) toast.success("🎟️ Coupon applied! Booking is free.");
    setError("");
  };

  /* ── FREE booking via coupon ── */
  const handleFreeConfirm = async () => {
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
          price: 0,
          seatPreference: booking.seatPreference,
          status: "confirmed",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.error || "Failed to save booking. Please try again.";
        setError(msg);
        toast.error("❌ " + msg);
        setConfirming(false);
        setConfirmStatus("");
        return;
      }

      setConfirmStatus("Sending confirmations...");
      await new Promise((r) => setTimeout(r, 1500));

      toast.success("✅ Booking confirmed!");
      localStorage.removeItem("skymock_booking");
      router.push(`/confirmation?bookingId=${data.data._id}`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Network error. Please check your connection and try again.";
      setError(message);
      setConfirming(false);
      setConfirmStatus("");
    }
  };

  /* ── Razorpay real payment ── */
  const handleRazorpayPayment = async () => {
    if (!booking) return;

    setConfirming(true);
    setError("");

    try {
      // Step 0: Deduct points server-side if using them
      if (usePoints && pointsDiscount > 0) {
        setConfirmStatus("Redeeming loyalty points...");
        const redeemRes = await fetch("/api/user/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pointsToUse: pointsToUse,
            ticketPrice: booking.price,
          }),
        });
        const redeemData = await redeemRes.json();
        if (!redeemRes.ok || !redeemData.success) {
          setError(redeemData.error || "Failed to redeem points.");
          toast.error("❌ Points redemption failed");
          setConfirming(false);
          setConfirmStatus("");
          return;
        }
        setPointsBalance(redeemData.data.newBalance);
        toast.success(`⭐ ${redeemData.data.pointsUsed} points redeemed! -₹${redeemData.data.discount}`);
      }

      // Step 1: Create Razorpay order on server
      setConfirmStatus("Creating payment order...");
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalPrice,
          receipt: `sky_${booking.flightId}_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        setError(orderData.error || "Failed to create payment order.");
        setConfirming(false);
        setConfirmStatus("");
        return;
      }

      setConfirmStatus("Opening payment gateway...");

      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        setError("Razorpay key not configured. Use coupon HACKATHON2026 for demo.");
        setConfirming(false);
        setConfirmStatus("");
        return;
      }

      // Step 2: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: razorpayKeyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "SkyMock",
        description: `${booking.airline} — ${booking.from} → ${booking.to}`,
        order_id: orderData.data.orderId,
        handler: async (response: RazorpayResponse) => {
          // Step 3: Verify payment on server
          setConfirmStatus("Verifying payment...");

          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: {
                  name: booking.name,
                  phone: booking.phone,
                  email: booking.email,
                  flightId: booking.flightId,
                  flightName: booking.flightName,
                  price: finalPrice,
                  seatPreference: booking.seatPreference,
                },
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              setError(
                verifyData.error || "Payment verification failed. Contact support."
              );
              setConfirming(false);
              setConfirmStatus("");
              return;
            }

            setConfirmStatus("Sending confirmations...");
            await new Promise((r) => setTimeout(r, 1200));

            toast.success("✅ Payment verified & booking confirmed!");
            localStorage.removeItem("skymock_booking");
            router.push(`/confirmation?bookingId=${verifyData.data._id}`);
          } catch {
            setError("Verification request failed. Contact support.");
            setConfirming(false);
            setConfirmStatus("");
          }
        },
        prefill: {
          name: booking.name,
          email: booking.email,
          contact: booking.phone,
        },
        theme: { color: "#22c55e" },
        modal: {
          ondismiss: () => {
            setConfirming(false);
            setConfirmStatus("");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Payment initialization failed.";
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
    <>
      {/* Razorpay Checkout Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />

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
                  step.active
                    ? "text-green-400 font-medium"
                    : "text-[var(--muted)]"
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
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-400">Points discount ({pointsToUse} pts)</span>
                    <span className="text-blue-400 font-semibold">
                      -₹{pointsDiscount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-3 border-t border-[var(--card-border)]">
                  <span className="text-[var(--foreground)]">Total</span>
                  <span
                    className={
                      couponApplied || pointsDiscount > 0
                        ? "text-green-400"
                        : "text-[var(--foreground)]"
                    }
                  >
                    {couponApplied
                      ? "FREE ✨"
                      : finalPrice === 0
                      ? "FREE ✨"
                      : `₹${finalPrice.toLocaleString("en-IN")}`}
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
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-lg"
                        aria-label="Coupon applied successfully"
                      >
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

              {/* Points Redemption section */}
              {!couponApplied && pointsBalance > 0 && (
                <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          Use Loyalty Points
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {pointsLoading ? "Loading..." : `${pointsBalance.toLocaleString("en-IN")} points available`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUsePoints(!usePoints)}
                      disabled={pointsLoading || pointsBalance < 500}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        usePoints ? "bg-blue-500" : "bg-[var(--card-border)]"
                      } disabled:opacity-40`}
                      aria-label="Toggle use loyalty points"
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                          usePoints ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  {usePoints && pointsDiscount > 0 && (
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 mt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--muted)]">Points used</span>
                        <span className="text-blue-400 font-medium">{pointsToUse}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-[var(--muted)]">Discount</span>
                        <span className="text-blue-400 font-medium">-₹{pointsDiscount.toLocaleString("en-IN")}</span>
                      </div>
                      <p className="text-[10px] text-[var(--muted)] mt-2">500 points = ₹100 • Max 50% of ticket price</p>
                    </div>
                  )}
                  {pointsBalance < 500 && (
                    <p className="text-xs text-[var(--muted)] mt-1">Need at least 500 points to redeem</p>
                  )}
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                  <p className="font-semibold mb-1">⚠️ Payment Error</p>
                  <p>{error}</p>
                </div>
              )}

              {/* Status text while processing */}
              {confirming && confirmStatus && (
                <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400 flex items-center gap-3">
                  <svg
                    className="h-4 w-4 animate-spin flex-shrink-0"
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
                  <span>{confirmStatus}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                {/* FREE booking button (coupon applied) */}
                {couponApplied && (
                  <button
                    id="confirm-booking-button"
                    onClick={handleFreeConfirm}
                    disabled={confirming}
                    aria-label="Confirm booking with coupon applied — free"
                    className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {confirming ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin"
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
                        Confirming Booking...
                      </>
                    ) : (
                      "✅ Confirm Booking — FREE"
                    )}
                  </button>
                )}

                {/* Razorpay pay button (no coupon) */}
                {!couponApplied && (
                  <button
                    id="razorpay-pay-button"
                    onClick={handleRazorpayPayment}
                    disabled={confirming || !razorpayLoaded}
                    aria-label={`Pay ${booking.price} rupees via Razorpay`}
                    className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {confirming ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin"
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
                        Processing Payment...
                      </>
                    ) : !razorpayLoaded ? (
                      "Loading payment gateway..."
                    ) : (
                      `💳 Pay ₹${finalPrice.toLocaleString("en-IN")} via Razorpay`
                    )}
                  </button>
                )}

                {/* Divider with OR */}
                {!couponApplied && (
                  <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                    <div className="h-px flex-1 bg-[var(--card-border)]" />
                    <span>or use coupon HACKATHON2026 for free</span>
                    <div className="h-px flex-1 bg-[var(--card-border)]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
