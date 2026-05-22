import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy to capture ?ref= referral code from URL and store it in a cookie.
 * This makes it available during the Auth.js signIn callback after Google OAuth redirect.
 */
export function proxy(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");

  if (ref) {
    const response = NextResponse.next();
    // Store referral code in cookie — expires in 7 days
    response.cookies.set("skymock_ref", ref.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      httpOnly: false,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signup"],
};
