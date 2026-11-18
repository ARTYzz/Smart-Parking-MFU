import { NextRequest, NextResponse } from "next/server";
import { authConfig, cookieOptions, FLOW_COOKIE, SESSION_COOKIE, signAuthToken, verifyAuthToken, verifyGoogleToken } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  let origin = request.nextUrl.origin;
  let secure = request.nextUrl.protocol === "https:";
  try {
    const config = authConfig(); origin = config.origin; secure = config.secure;
    const flow = await verifyAuthToken(request.cookies.get(FLOW_COOKIE)?.value ?? "", "flow");
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    if (!code || typeof flow.state !== "string" || state !== flow.state || typeof flow.nonce !== "string" || typeof flow.verifier !== "string") throw new Error("Invalid flow");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, cache: "no-store", signal: AbortSignal.timeout(15000),
      body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri, grant_type: "authorization_code", code_verifier: flow.verifier }),
    });
    if (!tokenResponse.ok) throw new Error("Token exchange failed");
    const tokens = await tokenResponse.json();
    if (typeof tokens.id_token !== "string") throw new Error("Missing token");
    const user = await verifyGoogleToken(tokens.id_token, config.clientId, flow.nonce);
    const response = NextResponse.redirect(new URL("/", origin));
    response.cookies.set(SESSION_COOKIE, await signAuthToken({ sub: user.id, name: user.name, email: user.email, role: user.role }, "session", 28800), cookieOptions(secure, 28800));
    response.cookies.set(FLOW_COOKIE, "", cookieOptions(secure, 0));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/login?error=google", origin));
    response.cookies.set(FLOW_COOKIE, "", cookieOptions(secure, 0));
    response.cookies.set(SESSION_COOKIE, "", cookieOptions(secure, 0));
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
