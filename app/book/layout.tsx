import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Your Flight — SkyMock",
  description: "Enter your details and book your domestic flight on SkyMock.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
