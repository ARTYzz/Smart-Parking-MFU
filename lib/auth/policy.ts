import type { User } from "@supabase/supabase-js";
import type { AppUser } from "@/lib/services/contracts";
export const UNIVERSITY_DOMAIN = "lamduan.mfu.ac.th";
const DEFAULT_SESSION_MINUTES = 480;

export function hasFreshOAuthLogin(claims: Record<string, unknown>, now = Date.now()) {
  const configuredMinutes = Number(process.env.AUTH_SESSION_MAX_MINUTES);
  const maxMinutes = Number.isSafeInteger(configuredMinutes) && configuredMinutes > 0
    ? configuredMinutes
    : DEFAULT_SESSION_MINUTES;
  if (!Array.isArray(claims.amr)) return false;

  // Token refresh changes JWT issuance time, but the OAuth event records the login time.
  const nowSeconds = Math.floor(now / 1000);
  return claims.amr.some(entry => entry?.method === "oauth" &&
    Number.isSafeInteger(entry.timestamp) && entry.timestamp > 0 &&
    entry.timestamp <= nowSeconds && nowSeconds - entry.timestamp < maxMinutes * 60);
}

export function isUniversityEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@lamduan\.mfu\.ac\.th$/i.test(email);
}
/** Inputs must come from Supabase getUser and verified getClaims, never client JSON. */
export function universityUser(user: User, claims: Record<string, unknown>): AppUser | null {
  if (claims.sub !== user.id || !isUniversityEmail(user.email) || !user.email_confirmed_at) return null;
  if (user.app_metadata.provider !== "google" || user.identities?.some(item => item.provider !== "google")) return null;
  if (!Array.isArray(claims.amr) || !claims.amr.some(method => method?.method === "oauth")) return null;
  const identity = user.identities?.find(item => item.provider === "google" &&
    item.identity_data?.email_verified === true &&
    typeof item.identity_data?.sub === "string" && item.identity_data.sub.length > 0 &&
    typeof item.identity_data?.email === "string" &&
    item.identity_data.email.toLowerCase() === user.email?.toLowerCase());
  if (!identity) return null;
  const picture = identity.identity_data?.avatar_url ?? identity.identity_data?.picture;
  let avatarUrl: string | undefined;
  if (typeof picture === "string") {
    try {
      const url = new URL(picture);
      if (url.protocol === "https:" && !url.username && !url.password) avatarUrl = url.href;
    } catch { /* A missing or invalid photo uses initials in the UI. */ }
  }
  // Preserve the Google subject used for existing mock history.
  return { id: `google:${identity.identity_data!.sub}`, email: user.email,
    name: typeof identity.identity_data?.full_name === "string" ? identity.identity_data.full_name : user.email,
    role: "student", avatarUrl };
}
