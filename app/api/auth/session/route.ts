import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, sessionUser } from "@/lib/auth/server";
export async function GET(request: NextRequest) {
  return NextResponse.json({ user: await sessionUser(request.cookies.get(SESSION_COOKIE)?.value) }, { headers: { "Cache-Control": "no-store" } });
}
