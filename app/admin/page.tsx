"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Header from "../components/Header";
import { useFetch } from "@/hooks/useFetch";
import { logger } from "@/lib/logger";

interface BookingRecord {
  _id: string;
  name: string;
  phone: string;
  email: string;
  flightId: string;
  flightName: string;
  price: number;
  seatPreference?: string;
  status: string;
  paymentId?: string;
  createdAt: string;
}

const PIE_COLORS = ["#4ade80", "#facc15", "#f87171"];

export default function AdminPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: bookingsData, loading, error: fetchError, retry: fetchBookings } = useFetch<BookingRecord[]>(
    authChecking ? null : "/api/bookings"
  );
  const bookings = bookingsData || [];
  const error = fetchError || "";

  // Admin auth check
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/admin/verify");
        const data = await res.json();
        if (!data.success || !data.data?.authorized) {
          toast.error("🚫 Access Denied — Admin only");
          router.push("/");
          return;
        }
      } catch (err) {
        logger.error("Failed to verify admin access", err);
        toast.error("Failed to verify admin access");
        router.push("/");
        return;
      }
      setAuthChecking(false);
    }

    if (authStatus === "unauthenticated") {
      toast.error("🚫 Please login first");
      router.push("/");
      return;
    }
    if (authStatus === "authenticated") {
      checkAdmin();
    }
  }, [authStatus, router]);


  // === Computed data ===
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    return {
      total: bookings.length,
      revenue: confirmed.reduce((s, b) => s + b.price, 0),
      today: bookings.filter((b) => new Date(b.createdAt).toDateString() === today).length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  const pieData = useMemo(() => {
    const c = bookings.filter((b) => b.status === "confirmed").length;
    const p = bookings.filter((b) => b.status === "pending").length;
    const x = bookings.filter((b) => b.status === "cancelled").length;
    return [
      { name: "Confirmed", value: c },
      { name: "Pending", value: p },
      { name: "Cancelled", value: x },
    ].filter((d) => d.value > 0);
  }, [bookings]);

  const last7DaysData = useMemo(() => {
    const days: { date: string; bookings: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const dayBookings = bookings.filter(
        (b) => new Date(b.createdAt).toDateString() === key
      );
      days.push({
        date: label,
        bookings: dayBookings.length,
        revenue: dayBookings
          .filter((b) => b.status === "confirmed")
          .reduce((s, b) => s + b.price, 0),
      });
    }
    return days;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let result = bookings;
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.phone.includes(q) ||
          b.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [bookings, statusFilter, search]);

  const handleExportCSV = () => {
    const headers = ["Booking ID", "Name", "Phone", "Email", "Flight", "Seat", "Price", "Status", "Date"];
    const rows = bookings.map((b) => [
      b._id,
      b.name,
      b.phone,
      b.email,
      b.flightName,
      b.seatPreference || "",
      b.price.toString(),
      b.status,
      new Date(b.createdAt).toLocaleString("en-IN"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skymock-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("📄 CSV exported!");
  };

  const statusColors: Record<string, string> = {
    confirmed: "bg-green-400/10 text-green-400",
    pending: "bg-yellow-400/10 text-yellow-400",
    cancelled: "bg-red-400/10 text-red-400",
  };

  if (authChecking || authStatus === "loading") {
    return (
      <>
        <Header />
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 animate-spin text-green-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[var(--muted)]">Verifying admin access...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Admin Dashboard</h1>
            <p className="text-sm text-[var(--muted)] mt-1">Monitor all SkyMock bookings & analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={bookings.length === 0}
              className="rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-green-400/30 transition-colors disabled:opacity-50"
              aria-label="Export bookings as CSV"
            >
              📥 Export CSV
            </button>
            <button
              onClick={fetchBookings}
              className="rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-green-400/30 transition-colors"
              aria-label="Refresh data"
            >
              🔄 Refresh
            </button>
            <Link
              href="/"
              className="rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-green-400/30 transition-colors"
            >
              ← Home
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: stats.total, color: "text-[var(--foreground)]", icon: "📊" },
            { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, color: "text-green-400", icon: "💰" },
            { label: "Today's Bookings", value: stats.today, color: "text-blue-400", icon: "📅" },
            { label: "Cancelled", value: stats.cancelled, color: "text-red-400", icon: "🚫" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[var(--muted)] uppercase tracking-wider">{s.label}</p>
                <span className="text-lg">{s.icon}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        {bookings.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            {/* Line chart — Bookings per day */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Bookings (7 Days)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={last7DaysData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#888", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#16161e", border: "1px solid #2a2a3a", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#888" }}
                  />
                  <Line type="monotone" dataKey="bookings" stroke="#4ade80" strokeWidth={2} dot={{ r: 4, fill: "#4ade80" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart — Status breakdown */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Status Breakdown</h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#16161e", border: "1px solid #2a2a3a", borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: "#888" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-[var(--muted)] text-sm">No data</div>
              )}
            </div>

            {/* Bar chart — Revenue per day */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Revenue (7 Days)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={last7DaysData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#888", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "#16161e", border: "1px solid #2a2a3a", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#888" }}
                    formatter={(value: any) => [`₹${Number(value || 0).toLocaleString("en-IN")}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Search & filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">🔍</span>
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-colors"
              aria-label="Search bookings"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-green-400 focus:outline-none transition-colors"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Results count */}
        <p className="text-xs text-[var(--muted)] mb-3">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>

        {/* Table */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
          {loading ? (
            <div className="space-y-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 px-4 py-4 border-b border-[var(--card-border)]">
                  <div className="h-3 w-16 rounded bg-[var(--card-border)]" />
                  <div className="h-3 w-24 rounded bg-[var(--card-border)]" />
                  <div className="h-3 w-20 rounded bg-[var(--card-border)]" />
                  <div className="h-3 w-28 rounded bg-[var(--card-border)]" />
                  <div className="h-3 w-12 rounded bg-[var(--card-border)]" />
                  <div className="h-5 w-16 rounded-full bg-[var(--card-border)]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-400 font-medium mb-2">{error}</p>
              <p className="text-xs text-[var(--muted)]">Check your MONGODB_URI in .env.local</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-4xl mb-3">{search || statusFilter !== "all" ? "🔍" : "📋"}</div>
              <p className="text-[var(--muted)]">
                {search || statusFilter !== "all" ? "No bookings match your filters" : "No bookings yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Bookings table">
                <thead>
                  <tr className="border-b border-[var(--card-border)] bg-[var(--input-bg)]">
                    {["ID", "Name", "Phone", "Flight", "Price", "Seat", "Status", "Date"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="border-b border-[var(--card-border)] hover:bg-[var(--input-bg)]/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{b._id.slice(-8)}</td>
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">{b.name}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{b.phone}</td>
                      <td className="px-4 py-3 text-[var(--foreground)]">{b.flightName}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">
                        {b.price === 0 ? "FREE" : `₹${b.price.toLocaleString("en-IN")}`}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">{b.seatPreference || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[b.status] || statusColors.pending}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            b.status === "confirmed" ? "bg-green-400" : b.status === "cancelled" ? "bg-red-400" : "bg-yellow-400"
                          }`} />
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)]">
                        {new Date(b.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
