const productionAdminOrigin = "https://admin-smart-parking.vercel.app";

export function adminFetch(path: string, init?: RequestInit) {
  const origin = process.env.PARKING_ADMIN_BASE_URL || productionAdminOrigin;
  const url = new URL(path, origin);
  return fetch(url, { ...init, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12000) });
}
