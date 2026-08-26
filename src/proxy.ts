import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE_NAME } from "@/lib/auth";

export function proxy(request: NextRequest) {
  if (!request.cookies.has(TOKEN_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
