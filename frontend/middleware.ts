import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/protected");
  const isOnboardingRoute = request.nextUrl.pathname.startsWith("/onboarding");

  // Redirect to login if accessing protected route or onboarding without token
  if ((isProtectedRoute || isOnboardingRoute) && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect to feed if accessing auth pages with token
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/protected/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/protected/:path*", "/onboarding/:path*"],
};
