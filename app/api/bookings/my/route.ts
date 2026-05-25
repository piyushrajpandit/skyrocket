import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async () => {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  await connectDB();
  const bookings = await Booking.find({ email: session.user.email }).sort({
    createdAt: -1,
  });

  return NextResponse.json({ success: true, data: bookings });
});
