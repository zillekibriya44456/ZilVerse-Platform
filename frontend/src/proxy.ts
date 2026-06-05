import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  // Better Auth default cookie name is better-auth.session_token
  // In production (HTTPS), it will be __secure-better-auth.session_token
  const sessionToken = 
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__secure-better-auth.session_token")?.value;

  const isAuthPage = 
    request.nextUrl.pathname.startsWith("/login") || 
    request.nextUrl.pathname.startsWith("/register");
  
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboardPage && !sessionToken) {
    // Redirect to login if trying to access dashboard without a session
    const loginUrl = new URL("/login", request.url);
    // Keep track of the original page to redirect back after login
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && sessionToken) {
    // Redirect to dashboard if logged-in user tries to visit login/register
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
