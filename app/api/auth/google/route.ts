import { randomBytes, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { authConfig, cookieOptions, FLOW_COOKIE, signAuthToken } from "@/lib/auth/server";
import { UNIVERSITY_DOMAIN } from "@/lib/auth/policy";

export async function GET(request: Request) {
  try {
    const config = authConfig();
    const state = randomBytes(32).toString("base64url");
    const nonce = randomBytes(32).toString("base64url");
    const verifier = randomBytes(32).toString("base64url");
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.redirectUri, response_type: "code", scope: "openid email profile", state, nonce, hd: UNIVERSITY_DOMAIN, prompt: "select_account", code_challenge: createHash("sha256").update(verifier).digest("base64url"), code_challenge_method: "S256" }).toString();
    const response = NextResponse.redirect(url);
    response.cookies.set(FLOW_COOKIE, await signAuthToken({ state, nonce, verifier }, "flow", 600), cookieOptions(config.secure, 600));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch { return NextResponse.redirect(new URL("/login?error=configuration", request.url)); }
}
