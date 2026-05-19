import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailData {
  name: string;
  email: string;
  phone: string;
  flightName: string;
  flightId: string;
  seatPreference?: string;
  price: number;
  bookingId: string;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  const {
    name,
    email,
    flightName,
    flightId,
    seatPreference,
    price,
    bookingId,
  } = data;

  const priceText = price === 0 ? "FREE" : `₹${price.toLocaleString("en-IN")}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <!-- Header -->
    <div style="text-align:center;padding:24px 0;border-bottom:1px solid #1a1a2e;">
      <div style="display:inline-block;background:linear-gradient(135deg,#4ade80,#10b981);padding:10px 14px;border-radius:10px;margin-bottom:12px;">
        <span style="color:white;font-size:18px;font-weight:bold;">✈️ SkyMock</span>
      </div>
      <h1 style="color:#f0f0f0;font-size:22px;margin:12px 0 4px;">Booking Confirmed!</h1>
      <p style="color:#888;font-size:14px;margin:0;">Your flight has been booked successfully</p>
    </div>

    <!-- Booking ID -->
    <div style="background:#0d2818;border:1px solid #166534;border-radius:12px;padding:16px;margin:24px 0;text-align:center;">
      <p style="color:#4ade80;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 6px;">Booking ID</p>
      <p style="color:#4ade80;font-size:16px;font-family:monospace;font-weight:bold;margin:0;">${bookingId}</p>
    </div>

    <!-- Flight Details -->
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:12px;">
      <h2 style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px;">Flight Details</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#888;padding:6px 0;font-size:14px;">Flight</td><td style="color:#f0f0f0;padding:6px 0;font-size:14px;text-align:right;font-weight:500;">${flightName}</td></tr>
        <tr><td style="color:#888;padding:6px 0;font-size:14px;">Flight ID</td><td style="color:#f0f0f0;padding:6px 0;font-size:14px;text-align:right;">${flightId}</td></tr>
        ${seatPreference ? `<tr><td style="color:#888;padding:6px 0;font-size:14px;">Seat</td><td style="color:#f0f0f0;padding:6px 0;font-size:14px;text-align:right;">${seatPreference}</td></tr>` : ""}
        <tr><td style="color:#888;padding:6px 0;font-size:14px;">Price</td><td style="color:#4ade80;padding:6px 0;font-size:14px;text-align:right;font-weight:bold;">${priceText}</td></tr>
      </table>
    </div>

    <!-- Passenger Details -->
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:24px;">
      <h2 style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px;">Passenger</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#888;padding:6px 0;font-size:14px;">Name</td><td style="color:#f0f0f0;padding:6px 0;font-size:14px;text-align:right;font-weight:500;">${name}</td></tr>
        <tr><td style="color:#888;padding:6px 0;font-size:14px;">Email</td><td style="color:#f0f0f0;padding:6px 0;font-size:14px;text-align:right;">${email}</td></tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px 0;border-top:1px solid #1a1a2e;">
      <p style="color:#555;font-size:12px;margin:0;">© 2026 SkyMock — Hackathon Demo Application</p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: "SkyMock <onboarding@resend.dev>",
    to: [email],
    subject: "✈️ Your SkyMock Booking is Confirmed!",
    html,
  });

  console.log("[Resend] Confirmation email sent to:", email);
}

export async function sendCancellationEmail(data: BookingEmailData) {
  const { name, email, flightName, flightId, price, bookingId } = data;

  const priceText = price === 0 ? "FREE" : `₹${price.toLocaleString("en-IN")}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <!-- Header -->
    <div style="text-align:center;padding:24px 0;border-bottom:1px solid #1a1a2e;">
      <div style="display:inline-block;background:linear-gradient(135deg,#ef4444,#dc2626);padding:10px 14px;border-radius:10px;margin-bottom:12px;">
        <span style="color:white;font-size:18px;font-weight:bold;">✈️ SkyMock</span>
      </div>
      <h1 style="color:#f0f0f0;font-size:22px;margin:12px 0 4px;">Booking Cancelled</h1>
      <p style="color:#888;font-size:14px;margin:0;">Your booking has been cancelled</p>
    </div>

    <!-- Booking ID -->
    <div style="background:#1c0a0a;border:1px solid #7f1d1d;border-radius:12px;padding:16px;margin:24px 0;text-align:center;">
      <p style="color:#f87171;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 6px;">Cancelled Booking</p>
      <p style="color:#f87171;font-size:16px;font-family:monospace;font-weight:bold;margin:0;">${bookingId}</p>
    </div>

    <!-- Details -->
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#888;padding:6px 0;font-size:14px;">Passenger</td><td style="color:#f0f0f0;padding:6px 0;font-size:14px;text-align:right;font-weight:500;">${name}</td></tr>
        <tr><td style="color:#888;padding:6px 0;font-size:14px;">Flight</td><td style="color:#f0f0f0;padding:6px 0;font-size:14px;text-align:right;">${flightName}</td></tr>
        <tr><td style="color:#888;padding:6px 0;font-size:14px;">Flight ID</td><td style="color:#f0f0f0;padding:6px 0;font-size:14px;text-align:right;">${flightId}</td></tr>
        <tr><td style="color:#888;padding:6px 0;font-size:14px;">Amount</td><td style="color:#f87171;padding:6px 0;font-size:14px;text-align:right;font-weight:bold;">${priceText}</td></tr>
        <tr><td style="color:#888;padding:6px 0;font-size:14px;">Status</td><td style="color:#f87171;padding:6px 0;font-size:14px;text-align:right;font-weight:bold;">CANCELLED</td></tr>
      </table>
    </div>

    <div style="text-align:center;padding:16px;background:#111;border:1px solid #222;border-radius:12px;margin-bottom:24px;">
      <p style="color:#888;font-size:13px;margin:0;">If a payment was made, a refund will be processed within 5-7 business days.</p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px 0;border-top:1px solid #1a1a2e;">
      <p style="color:#555;font-size:12px;margin:0;">© 2026 SkyMock — Hackathon Demo Application</p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: "SkyMock <onboarding@resend.dev>",
    to: [email],
    subject: "❌ Your SkyMock Booking has been Cancelled",
    html,
  });

  console.log("[Resend] Cancellation email sent to:", email);
}
