import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { sendBookingWhatsApp } from "@/lib/twilio";
import { sendBookingConfirmationEmail } from "@/lib/resend";
import { awardPoints, processReferralBonus } from "@/lib/points";
import { apiHandler } from "@/lib/apiHandler";
import { verifyPaymentSchema, formatZodError } from "@/lib/validations";
import { logger } from "@/lib/logger";

export const POST = apiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const validation = verifyPaymentSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: formatZodError(validation.error) },
      { status: 400 }
    );
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingData,
  } = validation.data;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json(
      { success: false, error: "Razorpay secret not configured" },
      { status: 500 }
    );
  }

  // Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { success: false, error: "Payment verification failed — invalid signature" },
      { status: 400 }
    );
  }

  // Signature verified — save booking to MongoDB
  await connectDB();

  const booking = await Booking.create({
    name: bookingData.name,
    phone: bookingData.phone,
    email: bookingData.email,
    flightId: bookingData.flightId,
    flightName: bookingData.flightName,
    price: bookingData.price,
    seatPreference: bookingData.seatPreference || undefined,
    status: "confirmed",
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    createdAt: new Date(),
  });

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

  // Award 100 loyalty points (non-blocking)
  awardPoints(booking.email, "Booking confirmed", 100).catch((err) => {
    logger.error("[Points] Award failed", err);
  });

  // Process referral bonus if applicable (non-blocking)
  processReferralBonus(booking.email).catch((err) => {
    logger.error("[Referral] Bonus processing failed", err);
  });

  return NextResponse.json(
    { success: true, data: booking },
    { status: 201 }
  );
});
