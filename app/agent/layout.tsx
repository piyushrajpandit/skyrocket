import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agent — SkyMock",
  description: "Chat with AI agents powered by Claude, GPT-4o, and Gemini to search flights, book tickets, and manage bookings.",
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
