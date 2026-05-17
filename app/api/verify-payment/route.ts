import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { sendBookingWhatsApp } from "@/lib/twilio";

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
    } = await request.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    if (!bookingData) {
      return NextResponse.json(
        { success: false, error: "Missing booking data" },
        { status: 400 }
      );
    }

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
    await dbConnect();

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
      console.error("[Twilio] Background send failed:", err);
    });

    return NextResponse.json(
      { success: true, data: booking },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[VerifyPayment] Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
