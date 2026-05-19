import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookings — SkyMock",
  description: "View and manage all your SkyMock flight bookings in one place.",
};

export default function MyBookingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
