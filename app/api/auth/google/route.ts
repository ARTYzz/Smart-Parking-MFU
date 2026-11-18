import { NextRequest, NextResponse } from "next/server";
import { requestAuth } from "@/lib/auth/server";
import { UNIVERSITY_DOMAIN } from "@/lib/auth/policy";
export async function GET(request: NextRequest) {
  try {
    const auth = requestAuth(request);
    const { data, error } = await auth.supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: new URL("/api/auth/google/callback", request.url).href,
        skipBrowserRedirect: true, scopes: "openid email profile",
        queryParams: { hd: UNIVERSITY_DOMAIN, prompt: "select_account" } },
    });
    if (error || !data.url) throw new Error("OAuth unavailable");
    return auth.finish(NextResponse.redirect(data.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=configuration", request.url));
  }
}
