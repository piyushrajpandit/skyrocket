import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — SkyMock",
  description: "Join SkyMock with a referral code and earn bonus loyalty points.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
