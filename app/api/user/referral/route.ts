import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async () => {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  await connectDB();
  const user = await User.findOne({
    email: session.user.email.toLowerCase(),
  }).select("referralCode pointsHistory");

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  // Count successful referrals
  const referralCount = await User.countDocuments({
    referredBy: user.referralCode,
  });

  // Sum referral-related points
  const referralPoints = user.pointsHistory
    .filter(
      (h: { action: string; points: number }) =>
        h.action.includes("Referral") && h.points > 0
    )
    .reduce((sum: number, h: { points: number }) => sum + h.points, 0);

  return NextResponse.json({
    success: true,
    data: {
      referralCode: user.referralCode,
      referralCount,
      referralPoints,
    },
    message: "Referral data retrieved",
  });
});
