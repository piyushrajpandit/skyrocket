import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiHandler } from "@/lib/apiHandler";
import { logger } from "@/lib/logger";

export const GET = apiHandler(async () => {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Not logged in", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin = adminEmails.includes(session.user.email.toLowerCase());

  logger.info("Admin verify check", { email: session.user.email, isAdmin });

  return NextResponse.json({
    success: true,
    data: {
      authorized: isAdmin,
      reason: isAdmin ? "Authorized" : "Access denied",
    },
  });
});
