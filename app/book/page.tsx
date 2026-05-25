"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import type { Flight } from "@/lib/flights";
import { useFetch } from "@/hooks/useFetch";

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const flightId = searchParams.get("flightId");

  const [flight, setFlight] = useState<Flight | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [seat, setSeat] = useState("Window");

  const { data: flightsData, loading } = useFetch<Flight[]>(flightId ? "/api/flights" : null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google", { callbackUrl: `/book?flightId=${flightId}` });
    }
  }, [status, flightId]);

  // Auto-fill name and email from Google session
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !name) setName(session.user.name);
      if (session.user.email && !email) setEmail(session.user.email);
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (flightsData && flightId) {
      const found = flightsData.find((f: Flight) => f.id === flightId);
      setFlight(found || null);
    }
  }, [flightsData, flightId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flight) return;

    const bookingData = {
      name,
      phone,
      email,
      seatPreference: seat,
      flightId: flight.id,
      flightName: `${flight.airline} ${flight.flightNumber}`,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      from: flight.from,
      to: flight.to,
      departure: flight.departure,
      duration: flight.duration,
      price: flight.price,
    };

    localStorage.setItem("skymock_booking", JSON.stringify(bookingData));
    router.push("/payment");
  };

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

  if (!flightId || (!loading && !flight)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">✈️</div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          No flight selected
        </h1>
        <p className="text-[var(--muted)] mb-6">
          Please search and select a flight first.
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
          { num: 2, label: "Details", active: true },
          { num: 3, label: "Payment" },
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
        Passenger Details
      </h1>

      {/* Auto-fill badge */}
      {session?.user && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-400/20 bg-green-400/5 px-4 py-2.5 text-sm text-green-400">
          <span>✨</span>
          <span>
            Logged in as <strong>{session.user.name}</strong> — name and email auto-filled
          </span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Flight Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
            <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
              Flight Summary
            </h2>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-32 rounded bg-[var(--card-border)]" />
                <div className="h-3 w-24 rounded bg-[var(--card-border)]" />
              </div>
            ) : flight ? (
              <>
                <p className="text-lg font-bold text-[var(--foreground)]">
                  {flight.airline}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {flight.flightNumber}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      {flight.departure}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{flight.from}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[var(--muted)]">
                      {flight.duration}
                    </p>
                    <div className="h-px w-16 bg-[var(--card-border)]" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--muted)]">{flight.to}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-[var(--card-border)] pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-[var(--muted)]">Price</span>
                    <span className="text-xl font-bold text-green-400">
                      ₹{flight.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--muted)]">Loading flight...</p>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">
              Passenger Details
            </h2>
            <p className="text-sm text-[var(--muted)] mb-6">
              Enter your information to continue to payment
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="booking-name" className="mb-1.5 block text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  id="booking-name"
                  type="text"
                  required
                  placeholder="Full Name (e.g. Piyush Raj)"
                  aria-label="Full name of passenger"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="booking-phone" className="mb-1.5 block text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  required
                  placeholder="Phone Number (e.g. 9876543210)"
                  aria-label="Phone number for WhatsApp confirmation"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="booking-email" className="mb-1.5 block text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="booking-email"
                  type="email"
                  required
                  placeholder="Email Address (e.g. piyush@email.com)"
                  aria-label="Email address for booking confirmation"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="booking-seat" className="mb-1.5 block text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Seat Preference
                </label>
                <select
                  id="booking-seat"
                  aria-label="Seat preference selection"
                  value={seat}
                  onChange={(e) => setSeat(e.target.value)}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-colors"
                >
                  <option value="Window">🪟 Window</option>
                  <option value="Middle">💺 Middle</option>
                  <option value="Aisle">🚶 Aisle</option>
                </select>
              </div>

              <button
                id="continue-to-payment-button"
                type="submit"
                disabled={!name || !phone || !email}
                aria-label="Continue to payment page"
                className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 animate-spin text-green-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[var(--muted)]">Loading booking page...</span>
          </div>
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
