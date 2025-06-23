import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isAppRoute = request.nextUrl.pathname.startsWith("/app");
  const isOnboardingRoute = request.nextUrl.pathname.startsWith("/onboarding");

  // Redirect to login if accessing app route or onboarding without token
  if ((isAppRoute || isOnboardingRoute) && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect to home if accessing auth pages with token
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/app/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/app/:path*", "/onboarding/:path*"],
};
