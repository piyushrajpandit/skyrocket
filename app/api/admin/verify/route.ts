import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ authorized: false, reason: "Not logged in" });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isAdmin = adminEmails.includes(session.user.email.toLowerCase());

    return NextResponse.json({
      authorized: isAdmin,
      reason: isAdmin ? "Authorized" : "Access denied",
    });
  } catch {
    return NextResponse.json(
      { authorized: false, reason: "Server error" },
      { status: 500 }
    );
  }
}
