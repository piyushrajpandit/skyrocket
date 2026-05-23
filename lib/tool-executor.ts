/**
 * Tool executor — maps AI tool calls to SkyMock API routes.
 * Runs server-side. Each function calls the internal API directly via DB.
 */

import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import mongoose from "mongoose";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case "search_flights":
        return await searchFlights(args);
      case "book_flight":
        return await bookFlight(args);
      case "cancel_booking":
        return await cancelBooking(args);
      case "modify_booking":
        return await modifyBooking(args);
      case "check_booking_status":
        return await checkBookingStatus(args);
      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Tool execution failed";
    return { success: false, error: msg };
  }
}

async function searchFlights(
  args: Record<string, unknown>
): Promise<ToolResult> {
  const from = (args.from as string) || "";
  const to = (args.to as string) || "";

  const res = await fetch(
    `${BASE_URL}/api/search-flights?dep=${encodeURIComponent(from)}&arr=${encodeURIComponent(to)}`
  );
  const data = await res.json();

  if (!data.success && data.fallback) {
    // Return hardcoded fallback flights
    return {
      success: true,
      data: [
        {
          id: "6E-2043",
          airline: "IndiGo",
          flightNumber: "6E-2043",
          from,
          to,
          departure: "6:00 AM",
          duration: "2h 35m",
          price: 4299,
          stops: "Non-stop",
        },
        {
          id: "AI-502",
          airline: "Air India",
          flightNumber: "AI-502",
          from,
          to,
          departure: "10:15 AM",
          duration: "2h 50m",
          price: 5899,
          stops: "Non-stop",
        },
        {
          id: "SG-723",
          airline: "SpiceJet",
          flightNumber: "SG-723",
          from,
          to,
          departure: "3:30 PM",
          duration: "3h 10m",
          price: 3499,
          stops: "1 stop",
        },
      ],
    };
  }

  return data;
}

async function bookFlight(args: Record<string, unknown>): Promise<ToolResult> {
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: args.name,
      phone: args.phone,
      email: args.email,
      flightId: args.flightId,
      flightName: args.flightName,
      price: args.price || 0,
      seatPreference: args.seatPreference || "Window",
      status: "confirmed",
    }),
  });
  const data = await res.json();

  if (data.success) {
    return {
      success: true,
      data: {
        bookingId: data.data._id,
        flightName: data.data.flightName,
        passenger: data.data.name,
        status: data.data.status,
        price: data.data.price,
        message: `Booking confirmed! ID: ${data.data._id}`,
      },
    };
  }
  return data;
}

async function cancelBooking(
  args: Record<string, unknown>
): Promise<ToolResult> {
  const id = args.bookingId as string;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: "Invalid booking ID format" };
  }

  const res = await fetch(`${BASE_URL}/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "cancelled" }),
  });
  const data = await res.json();

  if (data.success) {
    return {
      success: true,
      data: {
        bookingId: id,
        status: "cancelled",
        message: `Booking ${id} has been cancelled successfully.`,
      },
    };
  }
  return data;
}

async function modifyBooking(
  args: Record<string, unknown>
): Promise<ToolResult> {
  const id = args.bookingId as string;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: "Invalid booking ID format" };
  }

  await dbConnect();
  const booking = await Booking.findById(id);
  if (!booking) {
    return { success: false, error: "Booking not found" };
  }

  if (args.seatPreference)
    booking.seatPreference = args.seatPreference as string;
  if (args.phone) booking.phone = args.phone as string;
  await booking.save();

  return {
    success: true,
    data: {
      bookingId: id,
      seatPreference: booking.seatPreference,
      phone: booking.phone,
      message: `Booking ${id} updated successfully.`,
    },
  };
}

async function checkBookingStatus(
  args: Record<string, unknown>
): Promise<ToolResult> {
  const id = args.bookingId as string;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: "Invalid booking ID format" };
  }

  await dbConnect();
  const booking = await Booking.findById(id);

  if (!booking) {
    return { success: false, error: "Booking not found" };
  }

  return {
    success: true,
    data: {
      bookingId: booking._id,
      passenger: booking.name,
      email: booking.email,
      phone: booking.phone,
      flight: booking.flightName,
      flightId: booking.flightId,
      seat: booking.seatPreference,
      price: booking.price,
      status: booking.status,
      bookedOn: booking.createdAt,
    },
  };
}
