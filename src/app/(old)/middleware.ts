import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware() {
  console.log("===> app middleware");
  NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/:path*",
  // matcher: "/demo/:path*",
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  // '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
