import { NextRequest, NextResponse } from "next/server";
import { requestAuth } from "@/lib/auth/server";
export async function GET(request: NextRequest) {
  try {
    const auth = requestAuth(request);
    return auth.finish(NextResponse.json({ user: await auth.user() }));
  } catch {
    return NextResponse.json({ error: "Authentication unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
