import { NextRequest, NextResponse } from "next/server";
import { requestAuth } from "@/lib/auth/server";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const auth = requestAuth(request);
    const { error } = await auth.supabase.auth.signOut({ scope: "local" });
    return auth.finish(NextResponse.json(error ? { error: "Logout failed" } : { ok: true }, { status: error ? 503 : 200 }));
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
