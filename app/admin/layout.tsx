import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — SkyMock",
  description: "Monitor bookings, revenue analytics, and manage the SkyMock flight booking platform.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
