import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM!;

const client = twilio(accountSid, authToken);

interface WhatsAppBookingData {
  name: string;
  phone: string;
  flightName: string;
  seatPreference?: string;
  price: number;
  bookingId: string;
}

function formatPhone(phone: string): string {
  // Strip all non-digits
  const digits = phone.replace(/\D/g, "");
  // If already has country code (91...) and is 12 digits, use as-is
  if (digits.startsWith("91") && digits.length === 12) {
    return `whatsapp:+${digits}`;
  }
  // If 10 digits, prepend +91
  if (digits.length === 10) {
    return `whatsapp:+91${digits}`;
  }
  // Fallback: prepend + if not present
  return `whatsapp:+${digits}`;
}

export async function sendBookingWhatsApp(data: WhatsAppBookingData) {
  const to = formatPhone(data.phone);

  const body = `✈️ *SkyMock Booking Confirmed!*

Name: ${data.name}
Flight: ${data.flightName}
Route: Bangalore → Patna
Seat: ${data.seatPreference || "Not specified"}
Price: FREE (Coupon Applied)
Booking ID: ${data.bookingId}

Have a great flight! 🎉`;

  try {
    const message = await client.messages.create({
      body,
      from: whatsappFrom,
      to,
    });
    console.log(`[Twilio] WhatsApp sent: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Twilio] WhatsApp failed: ${msg}`);
    return { success: false, error: msg };
  }
}
