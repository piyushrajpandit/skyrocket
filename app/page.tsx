import Header from "./components/Header";
import SearchSection from "./components/SearchSection";

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pb-8 pt-16 sm:pb-12 sm:pt-24">
          {/* Background decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-green-400/[0.03] blur-[100px]" />
            <div className="absolute right-1/4 top-20 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-emerald-500/[0.02] blur-[80px]" />
          </div>

          {/* Flying plane animation */}
          <div className="pointer-events-none absolute top-32 left-0 w-full overflow-hidden opacity-20">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-green-400 fly-plane"
            >
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
          </div>

          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/5 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 pulse-dot" />
              <span className="text-xs font-medium text-green-400">
                Flights at lowest fares
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Fly Smart.{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Fly SkyMock.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
              Search, compare, and book the cheapest domestic flights across India.
              Lightning-fast results, zero hassle.
            </p>

            {/* Stats bar */}
            <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-8 text-center">
              <div>
                <p className="text-xl font-bold text-white">200+</p>
                <p className="text-[11px] text-[var(--muted)] uppercase tracking-wider">
                  Routes
                </p>
              </div>
              <div className="h-8 w-px bg-[var(--card-border)]" />
              <div>
                <p className="text-xl font-bold text-green-400">₹2,999</p>
                <p className="text-[11px] text-[var(--muted)] uppercase tracking-wider">
                  Starting from
                </p>
              </div>
              <div className="h-8 w-px bg-[var(--card-border)]" />
              <div>
                <p className="text-xl font-bold text-white">50K+</p>
                <p className="text-[11px] text-[var(--muted)] uppercase tracking-wider">
                  Bookings
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <div className="pb-20">
          <SearchSection />
        </div>

        {/* Features */}
        <section className="border-t border-[var(--card-border)] bg-[var(--card-bg)]/50 py-16">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3 sm:px-6">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: "Secure Payments",
                desc: "256-bit SSL encryption on every transaction",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                ),
                title: "Instant Confirmation",
                desc: "Get your e-ticket within seconds of booking",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                ),
                title: "Best Price Guarantee",
                desc: "We match any lower fare you find elsewhere",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 transition-all duration-300 hover:border-green-400/20"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-400/10 text-green-400 transition-colors group-hover:bg-green-400/20">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] py-6 text-center text-xs text-[var(--muted)]">
        <p>
          © 2026 SkyMock. This is a demo application — no real bookings are processed.
        </p>
      </footer>
    </>
  );
}
