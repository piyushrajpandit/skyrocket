import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { sendBookingWhatsApp } from "@/lib/twilio";
import { sendBookingConfirmationEmail } from "@/lib/resend";
import { awardPoints, processReferralBonus } from "@/lib/points";
import { apiHandler } from "@/lib/apiHandler";
import { bookingSchema, formatZodError } from "@/lib/validations";
import { logger } from "@/lib/logger";

export const GET = apiHandler(async () => {
  await connectDB();
  const bookings = await Booking.find({}).sort({ createdAt: -1 });
  return NextResponse.json({ success: true, data: bookings });
});

export const POST = apiHandler(async (request: NextRequest) => {
  await connectDB();

  const body = await request.json();
  const validation = bookingSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: formatZodError(validation.error) },
      { status: 400 }
    );
  }

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
  } = validation.data;

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
      logger.error("[Twilio] Background send failed", err);
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
      logger.error("[Resend] Background email failed", err);
    });

    // Award 100 loyalty points for booking (non-blocking)
    awardPoints(booking.email, "Booking confirmed", 100).catch((err) => {
      logger.error("[Points] Award failed", err);
    });

    // Process referral bonus if applicable (non-blocking)
    processReferralBonus(booking.email).catch((err) => {
      logger.error("[Referral] Bonus processing failed", err);
    });
  }

  return NextResponse.json(
    { success: true, data: booking },
    { status: 201 }
  );
});
