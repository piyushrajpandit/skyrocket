import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment — SkyMock",
  description: "Complete your flight booking payment securely on SkyMock.",
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
