/**
 * Shared tool definitions used across all AI providers (Claude, GPT, Gemini).
 * Each tool maps to an existing SkyMock API route.
 */

export interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export const AGENT_TOOLS: ToolDef[] = [
  {
    name: "search_flights",
    description:
      "Search for available flights between two Indian cities. Returns a list of flights with prices, airlines, times, and durations.",
    parameters: {
      type: "object",
      properties: {
        from: {
          type: "string",
          description:
            "Departure city name (e.g. Bangalore, Delhi, Mumbai, Patna)",
        },
        to: {
          type: "string",
          description:
            "Arrival city name (e.g. Patna, Delhi, Mumbai, Bangalore)",
        },
      },
      required: ["from", "to"],
    },
  },
  {
    name: "book_flight",
    description:
      "Book a flight for a passenger. Requires passenger details and flight ID. Use coupon HACKATHON2026 for free booking.",
    parameters: {
      type: "object",
      properties: {
        flightId: {
          type: "string",
          description: "The flight ID/number from search results",
        },
        flightName: {
          type: "string",
          description: "Airline name (e.g. IndiGo, Air India)",
        },
        name: { type: "string", description: "Passenger full name" },
        email: { type: "string", description: "Passenger email address" },
        phone: { type: "string", description: "Passenger phone number" },
        seatPreference: {
          type: "string",
          enum: ["Window", "Middle", "Aisle"],
          description: "Seat preference",
        },
        price: {
          type: "number",
          description: "Flight price in INR. Use 0 if using coupon HACKATHON2026",
        },
      },
      required: ["flightId", "flightName", "name", "email", "phone", "price"],
    },
  },
  {
    name: "cancel_booking",
    description: "Cancel an existing booking by its MongoDB booking ID.",
    parameters: {
      type: "object",
      properties: {
        bookingId: {
          type: "string",
          description: "The booking ID (MongoDB ObjectId)",
        },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "modify_booking",
    description:
      "Modify an existing booking's seat preference, phone number, or both.",
    parameters: {
      type: "object",
      properties: {
        bookingId: {
          type: "string",
          description: "The booking ID (MongoDB ObjectId)",
        },
        seatPreference: {
          type: "string",
          enum: ["Window", "Middle", "Aisle"],
          description: "New seat preference",
        },
        phone: {
          type: "string",
          description: "Updated phone number",
        },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "check_booking_status",
    description:
      "Check the status of a booking by its ID. Returns full booking details.",
    parameters: {
      type: "object",
      properties: {
        bookingId: {
          type: "string",
          description: "The booking ID (MongoDB ObjectId)",
        },
      },
      required: ["bookingId"],
    },
  },
];

/**
 * Convert our tool definitions to Claude format.
 */
export function toClaudeTools() {
  return AGENT_TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));
}

/**
 * Convert our tool definitions to OpenAI format.
 */
export function toOpenAITools() {
  return AGENT_TOOLS.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

/**
 * Convert our tool definitions to Gemini format.
 */
export function toGeminiTools() {
  return [
    {
      functionDeclarations: AGENT_TOOLS.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      })),
    },
  ];
}

export const SYSTEM_PROMPT = `You are SkyMock AI Travel Assistant. You help users search flights, book tickets, cancel bookings, and modify reservations on the SkyMock flight booking platform.

Key information:
- SkyMock offers domestic Indian flights
- Popular routes: Bangalore↔Patna, Delhi↔Mumbai, etc.
- Use coupon code HACKATHON2026 for free booking (sets price to 0)
- Seat options: Window, Middle, Aisle
- Booking IDs are MongoDB ObjectIds (24-character hex strings)

When a user asks you to do something, use the available tools to complete the task. Always confirm actions before executing them. Be concise and helpful.`;
