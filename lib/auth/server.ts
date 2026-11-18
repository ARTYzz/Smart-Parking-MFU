import { createRemoteJWKSet, jwtVerify, SignJWT, type JWTPayload } from "jose";
import type { AppUser } from "@/lib/services/contracts";
import { allowedGoogleClaims, isUniversityEmail } from "./policy";

export const SESSION_COOKIE = "mfu_session";
export const FLOW_COOKIE = "mfu_google_flow";
export function authConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const secret = process.env.AUTH_SECRET;
  const rawUrl = process.env.AUTH_URL;
  if (!clientId || !clientSecret || !secret || secret.length < 32 || !rawUrl) throw new Error("Auth not configured");
  const url = new URL(rawUrl);
  if (url.username || url.password || (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))) throw new Error("Invalid auth origin");
  return { clientId, clientSecret, origin: url.origin, redirectUri: `${url.origin}/api/auth/google/callback`, secure: url.protocol === "https:" };
}
export function isAuthConfigured() { try { authConfig(); return true; } catch { return false; } }
function key() {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) throw new Error("Missing auth secret");
  return new TextEncoder().encode(process.env.AUTH_SECRET);
}
export async function signAuthToken(payload: JWTPayload, kind: "flow" | "session", seconds: number) {
  return new SignJWT({ ...payload, kind }).setProtectedHeader({ alg: "HS256" }).setIssuer("mfu-smart-parking").setAudience(kind).setIssuedAt().setExpirationTime(`${seconds}s`).sign(key());
}
export async function verifyAuthToken(token: string, kind: "flow" | "session") {
  const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"], issuer: "mfu-smart-parking", audience: kind });
  if (payload.kind !== kind || typeof payload.exp !== "number") throw new Error("Invalid token");
  return payload;
}
export async function sessionUser(token?: string): Promise<AppUser | null> {
  if (!token) return null;
  try {
    const payload = await verifyAuthToken(token, "session");
    if (typeof payload.sub !== "string" || !payload.sub.startsWith("google:") || !isUniversityEmail(payload.email) || payload.role !== "student" || typeof payload.name !== "string") return null;
    return { id: payload.sub, email: payload.email, name: payload.name, role: "student" };
  } catch { return null; }
}
export const cookieOptions = (secure: boolean, maxAge: number) => ({ httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge });
const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
export async function verifyGoogleToken(token: string, clientId: string, nonce: string) {
  const { payload } = await jwtVerify(token, googleKeys, { algorithms: ["RS256"], issuer: ["https://accounts.google.com", "accounts.google.com"], audience: clientId });
  if (typeof payload.exp !== "number" || !allowedGoogleClaims(payload, nonce)) throw new Error("University account required");
  return { id: `google:${payload.sub}`, email: payload.email as string, name: typeof payload.name === "string" ? payload.name : payload.email as string, role: "student" as const };
}
