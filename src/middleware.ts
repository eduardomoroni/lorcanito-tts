// https://nextjs.org/docs/app/building-your-application/routing/middleware

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UAParser } from "ua-parser-js";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest, response: NextResponse) {
  console.log(request.url);

  if (request.nextUrl.pathname.startsWith("/game")) {
    const token = await getToken({ req: request });

    if (!token) {
      console.log("Sign in rewrite");
      return NextResponse.rewrite(
        new URL(
          `/auth/signin?cause="middleware-rewrite"${request.nextUrl?.searchParams}`,
          request.url
        )
      );
    }

    try {
      const ua = UAParser(request.headers.get("user-agent") || "");
      if (ua.device.type === "mobile") {
        response.cookies.set("device", "mobile");

        // return NextResponse.rewrite(new URL(`/mobile`, request.url));
      }
    } catch (e) {
      console.log(e);
    }
  }

  NextResponse.next();
  return;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  // '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
