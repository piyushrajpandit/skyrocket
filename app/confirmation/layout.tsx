import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Confirmed — SkyMock",
  description: "Your SkyMock flight booking is confirmed. Download your e-ticket and boarding pass.",
};

export default function ConfirmationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
