import Header from "./components/Header";
import SearchSection from "./components/SearchSection";

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-[var(--card-border)]">
          {/* Animated bg grid */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(var(--muted) 1px, transparent 1px), linear-gradient(90deg, var(--muted) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          {/* Flying plane */}
          <div className="absolute top-1/3 left-0 fly-plane pointer-events-none">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(74,222,128,0.3)"
              strokeWidth="1.5"
            >
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Fly Smart.{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Fly SkyMock.
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--muted)]">
                Search, compare, and book the cheapest domestic flights across
                India. Lightning-fast results, zero hassle.
              </p>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-12 flex max-w-md justify-center gap-8 sm:gap-16">
              {[
                { val: "200+", label: "Routes" },
                { val: "₹2,999", label: "Starting from" },
                { val: "50K+", label: "Bookings" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-green-400">{s.val}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search Section */}
        <SearchSection />

        {/* Features */}
        <section className="border-t border-[var(--card-border)] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: "⚡",
                  title: "Instant Search",
                  desc: "Real-time flight search across all major airlines",
                },
                {
                  icon: "🔒",
                  title: "Secure Booking",
                  desc: "Bank-grade encryption for all transactions",
                },
                {
                  icon: "💬",
                  title: "WhatsApp Updates",
                  desc: "Get booking confirmations via WhatsApp instantly",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 transition-all hover:border-green-400/20"
                >
                  <div className="mb-3 text-2xl">{item.icon}</div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-[var(--muted)]">
          © 2026 SkyMock. This is a demo application — no real bookings are
          processed.
        </div>
      </footer>
    </>
  );
}
