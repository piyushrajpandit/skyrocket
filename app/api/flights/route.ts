import { NextResponse } from "next/server";
import { flights } from "@/lib/flights";

export async function GET() {
  return NextResponse.json({
    success: true,
    count: flights.length,
    data: flights,
  });
}
