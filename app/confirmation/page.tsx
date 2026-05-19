"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
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
  const [generatingPdf, setGeneratingPdf] = useState(false);

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

  const handleDownloadTicket = useCallback(async () => {
    if (!booking) return;
    setGeneratingPdf(true);

    try {
      // Dynamic imports for client-only libraries
      const { jsPDF } = await import("jspdf");
      const QRCode = await import("qrcode");

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Colors
      const bgColor = [15, 15, 20] as const;
      const cardColor = [22, 22, 30] as const;
      const greenColor = [74, 222, 128] as const;
      const textColor = [240, 240, 240] as const;
      const mutedColor = [136, 136, 136] as const;

      // Full page dark background
      doc.setFillColor(...bgColor);
      doc.rect(0, 0, pageWidth, 297, "F");

      // === Header bar ===
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.roundedRect(15, 12, pageWidth - 30, 22, 4, 4, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("✈  SkyMock", 24, 25);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("E-TICKET / BOARDING PASS", pageWidth - 24, 25, { align: "right" });

      // === Status badge ===
      const statusText = booking.status.toUpperCase();
      const isConfirmed = booking.status === "confirmed";
      doc.setFillColor(...(isConfirmed ? greenColor : [248, 113, 113] as const));
      doc.roundedRect(pageWidth / 2 - 20, 40, 40, 8, 2, 2, "F");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(statusText, pageWidth / 2, 45.5, { align: "center" });

      // === Booking ID card ===
      doc.setFillColor(...cardColor);
      doc.roundedRect(15, 54, pageWidth - 30, 18, 3, 3, "F");
      doc.setTextColor(...mutedColor);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text("BOOKING ID", pageWidth / 2, 61, { align: "center" });
      doc.setTextColor(...greenColor);
      doc.setFontSize(11);
      doc.setFont("courier", "bold");
      doc.text(booking._id, pageWidth / 2, 68, { align: "center" });

      // === Flight Details card ===
      let y = 80;
      doc.setFillColor(...cardColor);
      doc.roundedRect(15, y, pageWidth - 30, 46, 3, 3, "F");

      doc.setTextColor(...mutedColor);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("FLIGHT DETAILS", 22, y + 8);

      // Dashed line
      doc.setDrawColor(60, 60, 70);
      doc.setLineDashPattern([1, 1], 0);
      doc.line(22, y + 11, pageWidth - 22, y + 11);
      doc.setLineDashPattern([], 0);

      const rows = [
        ["Flight", booking.flightName],
        ["Flight ID", booking.flightId],
        ["Seat", booking.seatPreference || "Any"],
        ["Price", booking.price === 0 ? "FREE" : `Rs. ${booking.price.toLocaleString("en-IN")}`],
      ];

      let rowY = y + 17;
      for (const [label, value] of rows) {
        doc.setTextColor(...mutedColor);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(label, 22, rowY);

        doc.setTextColor(...textColor);
        doc.setFont("helvetica", "bold");
        doc.text(value, pageWidth - 22, rowY, { align: "right" });
        rowY += 8;
      }

      // === Passenger Details card ===
      y = 132;
      doc.setFillColor(...cardColor);
      doc.roundedRect(15, y, pageWidth - 30, 38, 3, 3, "F");

      doc.setTextColor(...mutedColor);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("PASSENGER DETAILS", 22, y + 8);

      doc.setDrawColor(60, 60, 70);
      doc.setLineDashPattern([1, 1], 0);
      doc.line(22, y + 11, pageWidth - 22, y + 11);
      doc.setLineDashPattern([], 0);

      const passengerRows = [
        ["Name", booking.name],
        ["Email", booking.email],
        ["Phone", booking.phone],
      ];

      rowY = y + 17;
      for (const [label, value] of passengerRows) {
        doc.setTextColor(...mutedColor);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(label, 22, rowY);

        doc.setTextColor(...textColor);
        doc.setFont("helvetica", "bold");
        doc.text(value, pageWidth - 22, rowY, { align: "right" });
        rowY += 8;
      }

      // === QR Code ===
      y = 178;
      const qrDataUrl = await QRCode.toDataURL(booking._id, {
        width: 200,
        margin: 1,
        color: { dark: "#4ade80", light: "#16161e" },
      });

      doc.setFillColor(...cardColor);
      doc.roundedRect(pageWidth / 2 - 28, y, 56, 62, 3, 3, "F");
      doc.addImage(qrDataUrl, "PNG", pageWidth / 2 - 22, y + 4, 44, 44);

      doc.setTextColor(...mutedColor);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text("Scan to verify", pageWidth / 2, y + 55, { align: "center" });

      // === Footer ===
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(7);
      doc.text(
        `Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} • SkyMock Hackathon Demo`,
        pageWidth / 2,
        255,
        { align: "center" }
      );

      // Save
      doc.save(`SkyMock-Ticket-${booking._id.slice(-8)}.pdf`);
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
    } finally {
      setGeneratingPdf(false);
    }
  }, [booking]);

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

        {/* Notifications notice */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 text-center space-y-1">
          <p className="text-sm text-[var(--muted)]">
            📱 A WhatsApp confirmation has been sent to{" "}
            <span className="text-[var(--foreground)] font-medium">
              {booking.phone}
            </span>
          </p>
          <p className="text-sm text-[var(--muted)]">
            📧 A confirmation email has been sent to{" "}
            <span className="text-[var(--foreground)] font-medium">
              {booking.email}
            </span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownloadTicket}
          disabled={generatingPdf}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-60"
          aria-label="Download PDF ticket"
        >
          {generatingPdf ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating PDF...
            </>
          ) : (
            <>📄 Download Ticket</>
          )}
        </button>
        <Link
          href="/"
          className="flex-1 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-6 py-3 text-sm font-medium text-[var(--foreground)] text-center hover:border-green-400/30 transition-colors"
          aria-label="Go back to homepage"
        >
          Back to Home
        </Link>
        <Link
          href="/my-bookings"
          className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white text-center shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
          aria-label="View my bookings"
        >
          My Bookings
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
