import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deductPoints, getPointsBalance } from "@/lib/points";
import { apiHandler } from "@/lib/apiHandler";
import { redeemPointsSchema, formatZodError } from "@/lib/validations";

export const POST = apiHandler(async (request: NextRequest) => {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = redeemPointsSchema.safeParse(body);

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

  const { pointsToUse, ticketPrice } = parsed.data;

  // Validate balance
  const { points: balance } = await getPointsBalance(session.user.email);

  if (pointsToUse > balance) {
    return NextResponse.json(
      { success: false, error: "Insufficient points", code: "INSUFFICIENT_POINTS" },
      { status: 400 }
    );
  }

  // Convert: 500 points = ₹100 discount
  const discount = Math.floor(pointsToUse / 500) * 100;

  // Cap at 50% of ticket price
  const maxDiscount = Math.floor(ticketPrice * 0.5);
  const finalDiscount = Math.min(discount, maxDiscount);

  // Recalculate actual points used (in case we capped)
  const actualPointsUsed = Math.ceil(finalDiscount / 100) * 500;

  // Deduct points
  const result = await deductPoints(
    session.user.email,
    actualPointsUsed,
    `Redeemed for ₹${finalDiscount} discount`
  );

  if (!result) {
    return NextResponse.json(
      { success: false, error: "Failed to deduct points", code: "DEDUCT_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      pointsUsed: actualPointsUsed,
      discount: finalDiscount,
      newBalance: result.points,
      finalPrice: ticketPrice - finalDiscount,
    },
    message: `Redeemed ${actualPointsUsed} points for ₹${finalDiscount} discount`,
  });
});
