import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deductPoints, getPointsBalance } from "@/lib/points";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { pointsToUse, ticketPrice } = await request.json();

    if (!pointsToUse || pointsToUse <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid points amount" },
        { status: 400 }
      );
    }

    // Validate balance
    const { points: balance } = await getPointsBalance(session.user.email);

    if (pointsToUse > balance) {
      return NextResponse.json(
        { success: false, error: "Insufficient points" },
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
        { success: false, error: "Failed to deduct points" },
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
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
