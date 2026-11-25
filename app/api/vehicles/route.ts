import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requestAuth } from "@/lib/auth/server";
import { adminFetch } from "@/lib/admin-api";

async function forward(request: NextRequest, method: "GET" | "POST") {
  if (method === "POST" && request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const auth = requestAuth(request);
    const user = await auth.user();
    if (!user) return auth.finish(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    const key = process.env.PARKING_USER_API_KEY;
    if (!key || key.length < 32) {
      return auth.finish(NextResponse.json({ error: "Vehicle reviews unavailable" }, { status: 503 }));
    }
    const path = "/api/integration/v1/vehicle-reviews";
    const headers = { Authorization: `Bearer ${key}` };
    let upstream: Response;
    if (method === "GET") {
      upstream = await adminFetch(`${path}?${new URLSearchParams({ applicantId: user.id })}`, { headers });
    } else {
      const form = await request.formData().catch(() => null);
      const submissionId = form?.get("id");
      if (!form || typeof submissionId !== "string" || !/^[0-9a-f-]{36}$/i.test(submissionId)) {
        return auth.finish(NextResponse.json({ error: "Invalid submission" }, { status: 422 }));
      }
      const id = createHash("sha256").update(`${user.id}:${submissionId.toLowerCase()}`).digest("hex");
      form.set("id", id);
      form.set("vehicleId", id);
      form.set("applicantId", user.id);
      upstream = await adminFetch(path, { method: "POST", headers, body: form });
    }
    if (upstream.status === 401 || upstream.status >= 500) {
      return auth.finish(NextResponse.json({ error: "Vehicle reviews unavailable" }, { status: 503 }));
    }
    return auth.finish(NextResponse.json(await upstream.json(), { status: upstream.status }));
  } catch {
    return NextResponse.json({ error: "Vehicle reviews unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export function GET(request: NextRequest) { return forward(request, "GET"); }
export function POST(request: NextRequest) { return forward(request, "POST"); }
