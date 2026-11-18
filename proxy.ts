import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, sessionUser } from "@/lib/auth/server";
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (["/api/auth/google", "/api/auth/google/callback", "/api/auth/session", "/api/auth/logout"].includes(pathname)) return NextResponse.next();
  const user = await sessionUser(request.cookies.get(SESSION_COOKIE)?.value);
  if (pathname === "/login") return user ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  if (!user) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"] };
