import { NextRequest, NextResponse } from "next/server";
import { requestAuth } from "@/lib/auth/server";
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (["/api/auth/google", "/api/auth/google/callback", "/api/auth/session", "/api/auth/logout"].includes(pathname)) return NextResponse.next();
  const denied = () => pathname === "/login" ? NextResponse.next({ request }) : pathname.startsWith("/api/")
    ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    : NextResponse.redirect(new URL("/login", request.url));
  try {
    const auth = requestAuth(request);
    const user = await auth.user();
    if (!user) return auth.finish(denied());
    return auth.finish(pathname === "/login" ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next({ request }));
  } catch {
    const response = denied();
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"] };
