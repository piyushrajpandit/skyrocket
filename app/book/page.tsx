"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import type { Flight } from "@/lib/flights";

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const flightId = searchParams.get("flightId");

  const [flight, setFlight] = useState<Flight | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [seatPreference, setSeatPreference] = useState("");

  useEffect(() => {
    if (flightId) {
      fetch("/api/flights")
        .then((r) => r.json())
        .then((data) => {
          const found = data.data.find((f: Flight) => f.id === flightId);
          setFlight(found ?? null);
        });
    }
  }, [flightId]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flight) return;
    const bookingData = {
      name, phone, email, seatPreference,
      flightId: flight.id,
      flightName: `${flight.airline} ${flight.flightNumber}`,
      airline: flight.airline, flightNumber: flight.flightNumber,
      from: flight.from, to: flight.to,
      departure: flight.departure, duration: flight.duration,
      price: flight.price, logo: flight.logo,
    };
    localStorage.setItem("skymock_booking", JSON.stringify(bookingData));
    router.push("/payment");
  };

  if (!flightId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></svg>
        </div>
        <h1 className="text-xl font-semibold text-white">No flight selected</h1>
        <p className="text-sm text-[var(--muted)]">Please search and select a flight first.</p>
        <Link href="/" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-green-400 px-5 py-2.5 text-sm font-semibold text-gray-900 transition-all hover:bg-green-300">
          ← Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-[var(--muted)] transition-colors hover:text-white">
            <span className="text-sm">← Back</span>
          </Link>
          <div className="h-4 w-px bg-[var(--card-border)]" />
          <h1 className="text-sm font-semibold text-white">Passenger Details</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400 text-[10px] font-bold text-gray-900">1</div>
            <div className="h-px w-4 bg-[var(--card-border)]" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--card-border)] text-[10px] font-bold text-[var(--muted)]">2</div>
            <div className="h-px w-4 bg-[var(--card-border)]" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--card-border)] text-[10px] font-bold text-[var(--muted)]">3</div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Sidebar */}
            <div className="lg:col-span-2 lg:order-2">
              {flight ? (
                <div className="sticky top-24 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Flight Summary</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-400/10 border border-green-400/20">
                        <span className="text-xs font-bold text-green-400">{flight.logo}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{flight.airline}</p>
                        <p className="text-xs text-[var(--muted)] font-mono">{flight.flightNumber}</p>
                      </div>
                    </div>
                    <div className="h-px bg-[var(--card-border)]" />
                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <span className="text-[var(--muted)]">Route</span>
                      <span className="text-white font-medium text-right">{flight.from} → {flight.to}</span>
                      <span className="text-[var(--muted)]">Departure</span>
                      <span className="text-white font-medium text-right">{flight.departure}</span>
                      <span className="text-[var(--muted)]">Duration</span>
                      <span className="text-white font-medium text-right">{flight.duration}</span>
                    </div>
                    <div className="h-px bg-[var(--card-border)]" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--muted)]">Total Fare</span>
                      <span className="text-xl font-bold text-green-400">₹{flight.price.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 text-center">
                  <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-green-400/30 border-t-green-400" />
                  <p className="mt-3 text-sm text-[var(--muted)]">Loading flight...</p>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="lg:col-span-3 lg:order-1">
              <form onSubmit={handleContinue} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-white">Passenger Details</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">Enter your information to continue to payment</p>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Full Name</label>
                    <input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-white placeholder-[var(--muted)]/50 outline-none transition-all focus:border-green-400/50 focus:ring-2 focus:ring-green-400/10" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Phone Number</label>
                    <input id="phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-white placeholder-[var(--muted)]/50 outline-none transition-all focus:border-green-400/50 focus:ring-2 focus:ring-green-400/10" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Email Address</label>
                    <input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-white placeholder-[var(--muted)]/50 outline-none transition-all focus:border-green-400/50 focus:ring-2 focus:ring-green-400/10" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="seat" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Seat Preference</label>
                    <select id="seat" value={seatPreference} onChange={(e) => setSeatPreference(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-white outline-none transition-all focus:border-green-400/50 focus:ring-2 focus:ring-green-400/10 cursor-pointer" required>
                      <option value="" disabled>Select seat preference</option>
                      <option value="Window">🪟 Window</option>
                      <option value="Middle">🔲 Middle</option>
                      <option value="Aisle">🚶 Aisle</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={!flight}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-3.5 text-sm font-bold text-gray-900 transition-all duration-200 hover:from-green-300 hover:to-emerald-400 hover:shadow-lg hover:shadow-green-400/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                  Continue to Payment →
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400/30 border-t-green-400" /></div>}>
      <BookingForm />
    </Suspense>
  );
}
