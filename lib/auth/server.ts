import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { universityUser } from "./policy";

export function authConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || new URL(url).protocol !== "https:") throw new Error("Supabase not configured");
  return { url, key };
}
export function isAuthConfigured() { try { authConfig(); return true; } catch { return false; } }

/** One client per request; carry refreshed cookies onto every response, including redirects. */
export function requestAuth(request: NextRequest) {
  const config = authConfig();
  const pending = new Map<string, { name: string; value: string; options: CookieOptions }>();
  const supabase = createServerClient(config.url, config.key, {
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/" },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(15000) }) },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        for (const cookie of values) {
          pending.set(cookie.name, cookie);
          request.cookies.set(cookie.name, cookie.value);
        }
      },
    },
  });
  function finish(response: NextResponse) {
    for (const { name, value, options } of pending.values()) response.cookies.set(name, value, options);
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }
  async function user() {
    // Validate with the Auth server; never trust getSession's stored user metadata.
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const claims = await supabase.auth.getClaims();
    if (claims.error || !claims.data) return null;
    return universityUser(data.user, claims.data.claims);
  }
  return { supabase, finish, user };
}
