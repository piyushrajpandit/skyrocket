import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { sendBookingWhatsApp } from "@/lib/twilio";

export async function GET() {
  try {
    await dbConnect();
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: bookings });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, phone, email, flightId, flightName, price, seatPreference, status } = body;

    if (!name || !phone || !email || !flightId || !flightName || !price) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const booking = await Booking.create({
      name,
      phone,
      email,
      flightId,
      flightName,
      price,
      seatPreference: seatPreference || undefined,
      status: status || "pending",
      createdAt: new Date(),
    });

    // Send WhatsApp confirmation (non-blocking — don't fail the booking if Twilio errors)
    if (booking.status === "confirmed") {
      sendBookingWhatsApp({
        name: booking.name,
        phone: booking.phone,
        flightName: booking.flightName,
        seatPreference: booking.seatPreference,
        price: booking.price,
        bookingId: booking._id.toString(),
      }).catch((err) => {
        console.error("[Twilio] Background send failed:", err);
      });
    }

    return NextResponse.json(
      { success: true, data: booking },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
