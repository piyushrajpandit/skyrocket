import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Rewards — SkyMock",
  description: "View your loyalty points balance, points history, and redeem rewards on SkyMock.",
};

export default function MyRewardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
