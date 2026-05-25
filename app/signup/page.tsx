"use client";

import { useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";

function SignupContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    // The middleware already captured ?ref= into a cookie.
    // Now redirect to Google sign-in automatically.
    signIn("google", { callbackUrl: "/" });
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="text-6xl mb-4">🚀</div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
        Joining SkyMock
      </h1>
      {ref && (
        <p className="text-sm text-green-400 mb-4">
          Referred by code:{" "}
          <span className="font-mono font-bold">{ref.toUpperCase()}</span>
        </p>
      )}
      <div className="flex items-center gap-3">
        <svg className="h-5 w-5 animate-spin text-green-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-[var(--muted)]">Redirecting to sign in...</span>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="flex flex-1 flex-col items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 animate-spin text-green-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-[var(--muted)]">Loading...</span>
            </div>
          </div>
        }
      >
        <SignupContent />
      </Suspense>
    </>
  );
}
