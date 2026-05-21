import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer a Friend — SkyMock",
  description: "Share your referral code and earn loyalty points when friends sign up and book flights on SkyMock.",
};

export default function ReferLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
