import { NextRequest, NextResponse } from "next/server";
import { requestAuth } from "@/lib/auth/server";
export async function GET(request: NextRequest) {
  const failure = () => NextResponse.redirect(new URL("/login?error=google", request.url));
  try {
    const auth = requestAuth(request);
    const code = request.nextUrl.searchParams.get("code");
    if (!code || request.nextUrl.searchParams.has("error")) return auth.finish(failure());
    const { error } = await auth.supabase.auth.exchangeCodeForSession(code);
    if (error) return auth.finish(failure());
    if (!await auth.user()) {
      await auth.supabase.auth.signOut({ scope: "local" });
      return auth.finish(failure());
    }
    return auth.finish(NextResponse.redirect(new URL("/", request.url)));
  } catch { return failure(); }
}
