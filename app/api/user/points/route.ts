import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPointsBalance } from "@/lib/points";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async () => {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const data = await getPointsBalance(session.user.email);

  return NextResponse.json({
    success: true,
    data,
    message: "Points balance retrieved",
  });
});
