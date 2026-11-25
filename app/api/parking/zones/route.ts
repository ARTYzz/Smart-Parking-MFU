import { adminFetch } from "@/lib/admin-api";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const upstream = await adminFetch("/api/public/zones/status");
    if (upstream.ok) return Response.json(await upstream.json(), { headers });
  } catch { /* Return a service error without disclosing the upstream connection. */ }
  return Response.json({ error: "Parking status unavailable" }, { status: 503, headers });
}
