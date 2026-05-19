import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { sendCancellationEmail } from "@/lib/resend";
import mongoose from "mongoose";
import Razorpay from "razorpay";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (status !== "cancelled") {
      return NextResponse.json(
        { success: false, error: "Only cancellation is supported" },
        { status: 400 }
      );
    }

    await dbConnect();

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { success: false, error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Update status
    booking.status = "cancelled";
    await booking.save();

    // Send cancellation email (non-blocking)
    sendCancellationEmail({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      flightName: booking.flightName,
      flightId: booking.flightId,
      seatPreference: booking.seatPreference,
      price: booking.price,
      bookingId: booking._id.toString(),
    }).catch((err) => {
      console.error("[Resend] Cancellation email failed:", err);
    });

    // Razorpay refund if payment was real (non-blocking)
    if (booking.paymentId) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (keyId && keySecret) {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        razorpay.payments
          .refund(booking.paymentId, {
            amount: Math.round(booking.price * 100),
            speed: "normal",
          })
          .then(() => {
            console.log("[Razorpay] Refund initiated for:", booking.paymentId);
          })
          .catch((err: unknown) => {
            console.error("[Razorpay] Refund failed:", err);
          });
      }
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
