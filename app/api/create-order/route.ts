import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { apiHandler } from "@/lib/apiHandler";
import { createOrderSchema, formatZodError } from "@/lib/validations";
import { logger } from "@/lib/logger";

export const POST = apiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: formatZodError(parsed.error),
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  const { amount, currency, receipt } = parsed.data;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { success: false, error: "Razorpay credentials not configured", code: "CONFIG_ERROR" },
      { status: 500 }
    );
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // Convert to paise
    currency,
    receipt: receipt || `skymock_${Date.now()}`,
  });

  logger.info("Razorpay order created", { orderId: order.id });

  return NextResponse.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    },
    message: "Payment order created",
  });
});
