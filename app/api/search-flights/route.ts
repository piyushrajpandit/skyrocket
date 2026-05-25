import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { apiHandler } from "@/lib/apiHandler";
import { logger } from "@/lib/logger";

/* ── City name → IATA code mapping ── */
const cityToIATA: Record<string, string> = {
  bangalore: "BLR",
  bengaluru: "BLR",
  patna: "PAT",
  delhi: "DEL",
  "new delhi": "DEL",
  mumbai: "BOM",
  kolkata: "CCU",
  chennai: "MAA",
  hyderabad: "HYD",
  pune: "PNQ",
  ahmedabad: "AMD",
  jaipur: "JAI",
  goa: "GOI",
  lucknow: "LKO",
  kochi: "COK",
  guwahati: "GAU",
  varanasi: "VNS",
  chandigarh: "IXC",
  indore: "IDR",
  bhopal: "BHO",
  ranchi: "IXR",
  coimbatore: "CJB",
  nagpur: "NAG",
  thiruvananthapuram: "TRV",
  trivandrum: "TRV",
  srinagar: "SXR",
  amritsar: "ATQ",
  mangalore: "IXE",
  visakhapatnam: "VTZ",
  vizag: "VTZ",
  bhubaneswar: "BBI",
  raipur: "RPR",
  madurai: "IXM",
  dehradun: "DED",
  udaipur: "UDR",
  leh: "IXL",
  bagdogra: "IXB",
  siliguri: "IXB",
};

function resolveIATA(input: string): string | null {
  const cleaned = input.trim().toLowerCase();
  // If already looks like a 3-letter IATA code
  if (/^[A-Z]{3}$/i.test(cleaned)) {
    return cleaned.toUpperCase();
  }
  return cityToIATA[cleaned] || null;
}

interface AviationstackFlight {
  flight: { iata: string | null; number: string | null };
  airline: { name: string | null; iata: string | null };
  departure: {
    airport: string | null;
    iata: string | null;
    scheduled: string | null;
    estimated: string | null;
  };
  arrival: {
    airport: string | null;
    iata: string | null;
    scheduled: string | null;
    estimated: string | null;
  };
  flight_status: string | null;
}

function formatTime(isoString: string | null): string {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "N/A";
  }
}

function calcDuration(dep: string | null, arr: string | null): string {
  if (!dep || !arr) return "N/A";
  try {
    const diff = new Date(arr).getTime() - new Date(dep).getTime();
    if (diff <= 0) return "N/A";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.round((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  } catch {
    return "N/A";
  }
}

export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const depCity = searchParams.get("dep") || "";
  const arrCity = searchParams.get("arr") || "";

  const depIATA = resolveIATA(depCity);
  const arrIATA = resolveIATA(arrCity);

  if (!depIATA || !arrIATA) {
    return NextResponse.json(
      {
        success: false,
        error: `Could not resolve IATA codes for "${depCity}" → "${arrCity}". Try city names like Bangalore, Delhi, Mumbai.`,
      },
      { status: 400 }
    );
  }

  const API_KEY = process.env.AVIATIONSTACK_KEY;

  if (!API_KEY) {
    return NextResponse.json(
      { success: false, error: "AVIATIONSTACK_KEY is not configured", fallback: true },
      { status: 500 }
    );
  }

  try {
    const response = await axios.get("http://api.aviationstack.com/v1/flights", {
      params: {
        access_key: API_KEY,
        dep_iata: depIATA,
        arr_iata: arrIATA,
        limit: 10,
      },
      timeout: 10000,
    });

    const rawData = response.data?.data;

    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return NextResponse.json(
        { success: true, data: [], message: "No flights found for this route" }
      );
    }

    const flights = rawData
      .filter((f: AviationstackFlight) => f.flight?.iata || f.flight?.number)
      .map((f: AviationstackFlight, index: number) => {
        const flightNumber =
          f.flight?.iata || `${f.airline?.iata || "XX"}-${f.flight?.number || index}`;
        const airlineName = f.airline?.name || "Unknown Airline";
        const depTime = f.departure?.scheduled || f.departure?.estimated || null;
        const arrTime = f.arrival?.scheduled || f.arrival?.estimated || null;

        // Estimate a realistic price (Aviationstack free tier doesn't include prices)
        const basePrice = 3000 + Math.floor(Math.random() * 6000);

        return {
          id: flightNumber,
          airline: airlineName,
          flightNumber: flightNumber,
          logo: (f.airline?.iata || "XX").substring(0, 2),
          from: depCity,
          to: arrCity,
          departure: formatTime(depTime),
          duration: calcDuration(depTime, arrTime),
          price: basePrice,
          stops: "Non-stop",
        };
      });

    return NextResponse.json({ success: true, data: flights, source: "aviationstack" });
  } catch (error) {
    logger.error("[Aviationstack] API call failed", error);
    return NextResponse.json(
      { success: false, error: "Aviationstack API failed", fallback: true },
      { status: 502 }
    );
  }
});
