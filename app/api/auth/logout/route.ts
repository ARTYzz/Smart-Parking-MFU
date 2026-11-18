import { NextRequest, NextResponse } from "next/server";
import { authConfig, cookieOptions, SESSION_COOKIE, FLOW_COOKIE } from "@/lib/auth/server";
export async function POST(request: NextRequest) {
  let origin = request.nextUrl.origin;
  try { origin = authConfig().origin; } catch { /* Can clear a stale session during configuration changes. */ }
  if (request.headers.get("origin") !== origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  for (const name of [SESSION_COOKIE, FLOW_COOKIE]) response.cookies.set(name, "", cookieOptions(new URL(origin).protocol === "https:", 0));
  return response;
}
