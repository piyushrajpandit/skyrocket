import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { sendBookingWhatsApp } from "@/lib/twilio";
import { sendBookingConfirmationEmail } from "@/lib/resend";
import { awardPoints, processReferralBonus } from "@/lib/points";

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
    const {
      name,
      phone,
      email,
      flightId,
      flightName,
      price,
      seatPreference,
      status,
      pointsDiscount,
    } = body;

    if (
      !name ||
      !phone ||
      !email ||
      !flightId ||
      !flightName ||
      price === undefined
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const finalPrice =
      pointsDiscount && pointsDiscount > 0
        ? Math.max(0, price - pointsDiscount)
        : price;

    const booking = await Booking.create({
      name,
      phone,
      email,
      flightId,
      flightName,
      price: finalPrice,
      seatPreference: seatPreference || undefined,
      status: status || "pending",
      createdAt: new Date(),
    });

    // If confirmed, send notifications + award points
    if (booking.status === "confirmed") {
      // Send WhatsApp confirmation (non-blocking)
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

      // Send confirmation email (non-blocking)
      sendBookingConfirmationEmail({
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        flightName: booking.flightName,
        flightId: booking.flightId,
        seatPreference: booking.seatPreference,
        price: booking.price,
        bookingId: booking._id.toString(),
      }).catch((err) => {
        console.error("[Resend] Background email failed:", err);
      });

      // Award 100 loyalty points for booking (non-blocking)
      awardPoints(booking.email, "Booking confirmed", 100).catch((err) => {
        console.error("[Points] Award failed:", err);
      });

      // Process referral bonus if applicable (non-blocking)
      processReferralBonus(booking.email).catch((err) => {
        console.error("[Referral] Bonus processing failed:", err);
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
