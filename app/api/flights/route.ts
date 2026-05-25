import { NextResponse } from "next/server";
import { flights } from "@/lib/flights";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async () => {
  return NextResponse.json({
    success: true,
    data: flights,
    message: `Found ${flights.length} flights`,
  });
});
