export const UNIVERSITY_DOMAIN = "lamduan.mfu.ac.th";
export function isUniversityEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@lamduan\.mfu\.ac\.th$/i.test(email);
}
/** Call only after cryptographic verification of the Google ID token. */
export function allowedGoogleClaims(claims: Record<string, unknown>, nonce: string): boolean {
  return typeof claims.sub === "string" && claims.sub.length > 0 &&
    claims.email_verified === true && isUniversityEmail(claims.email) &&
    claims.hd === UNIVERSITY_DOMAIN && claims.nonce === nonce;
}
