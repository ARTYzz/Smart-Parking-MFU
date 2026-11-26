import { NextRequest, NextResponse } from "next/server";
import { requestAuth } from "@/lib/auth/server";
import { adminFetch } from "@/lib/admin-api";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const auth = requestAuth(request);
    const user = await auth.user();
    if (!user) return auth.finish(NextResponse.json({ error: "กรุณาเข้าสู่ระบบใหม่" }, { status: 401 }));
    const key = process.env.PARKING_USER_API_KEY;
    if (!key || key.length < 32) {
      return auth.finish(NextResponse.json({ error: "ระบบจองไม่พร้อมใช้งาน" }, { status: 503 }));
    }
    const command = await request.json().catch(() => null);
    if (!command || typeof command.action !== "string") {
      return auth.finish(NextResponse.json({ error: "ข้อมูลคำขอไม่ถูกต้อง" }, { status: 422 }));
    }
    const upstream = await adminFetch("/api/integration/v1/parking-bookings", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ applicantId: user.id, role: user.role === "student" ? "student" : "staff", command }),
    });
    if (upstream.status === 401 || upstream.status >= 500) {
      return auth.finish(NextResponse.json({ error: "ระบบจองไม่พร้อมใช้งาน" }, { status: 503 }));
    }
    return auth.finish(NextResponse.json(await upstream.json(), { status: upstream.status }));
  } catch {
    return NextResponse.json({ error: "ระบบจองไม่พร้อมใช้งาน" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
