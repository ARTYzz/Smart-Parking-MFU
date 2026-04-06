import { AppHeader } from "@/components/layout/app-header";
import { BackLink } from "@/components/layout/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/parking/empty-state";
import { SubZoneCard } from "@/components/parking/subzone-card";
import { ZoneSummaryCard } from "@/components/parking/zone-summary-card";
import { getMockParkingDetailsByZone } from "@/lib/detail";
import { buildParkingSummary } from "@/lib/summary";
import {
  getC5CameraSlots,
  getC5CameraSummary,
  getParkingZoneDetails,
} from "@/lib/api";

interface ZoneDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ZoneDetailPage({ params }: ZoneDetailPageProps) {
  const { id } = await params;
  const zoneId = id.toUpperCase();
  const isC5 = zoneId === "C5";
  const hasDetailsApi = Boolean(process.env.NEXT_PUBLIC_DETAILS_API);

  const fallbackReasons: string[] = [];

  const [cameraSummary, c5Slots, detailSubZones] = await Promise.all([
    isC5
      ? getC5CameraSummary().catch((error) => {
          const reason = error instanceof Error ? error.message : "unknown error";
          fallbackReasons.push(`camera summary: ${reason}`);
          return null;
        })
      : Promise.resolve(null),
    isC5
      ? getC5CameraSlots().catch((error) => {
          const reason = error instanceof Error ? error.message : "unknown error";
          fallbackReasons.push(`camera slots: ${reason}`);
          return null;
        })
      : Promise.resolve(null),
    hasDetailsApi
      ? getParkingZoneDetails(zoneId).catch((error) => {
          const reason = error instanceof Error ? error.message : "unknown error";
          fallbackReasons.push(`details API: ${reason}`);
          return [];
        })
      : Promise.resolve([]),
  ]);

  let dataSource: "camera-slots" | "details-api" | "mock" = "mock";
  let subZones = getMockParkingDetailsByZone(zoneId);

  if (isC5 && c5Slots && c5Slots.length > 0) {
    dataSource = "camera-slots";
    subZones = c5Slots;
  } else if (detailSubZones.length > 0) {
    dataSource = "details-api";
    subZones = detailSubZones;
  } else {
    if (isC5 && (!c5Slots || c5Slots.length === 0)) {
      fallbackReasons.push("camera slots: empty response");
    }
    if (hasDetailsApi) {
      fallbackReasons.push("details API: empty response");
    } else {
      fallbackReasons.push("details API: not configured (optional)");
    }
  }

  const sourceLabel =
    dataSource === "camera-slots"
      ? "camera slots API"
      : dataSource === "details-api"
        ? "NEXT_PUBLIC_DETAILS_API"
        : "mock fallback";

  const summary = buildParkingSummary(subZones);
  const generatedAt = cameraSummary?.timestamp
    ? new Date(cameraSummary.timestamp).toLocaleString("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
      });

  return (
    <main className="min-h-screen">
      <AppHeader />

      <PageContainer>
        <div className="mb-6">
          <BackLink href="/" label="กลับหน้าหลัก" />
        </div>

        <section className="section-surface rounded-3xl p-6 md:p-8">
          <p className="label-caps text-xs font-semibold text-[#7D000F]/80">
            Zone Detail
          </p>
          <h1 className="display-font mt-2 text-4xl font-extrabold text-[#191C1D] md:text-5xl">
            โซน {zoneId}
          </h1>
          <p className="mt-3 max-w-2xl text-[#59413F]">
            ตรวจสอบข้อมูลพื้นที่ย่อยภายในโซนนี้
            พร้อมจำนวนช่องจอดว่างและใช้งานแยกตามประเภทยานพาหนะ
          </p>
          <p className="mt-4 text-xs text-[#59413F]">อัปเดตล่าสุด {generatedAt}</p>
          <p className="mt-1 text-xs text-[#59413F]">แหล่งข้อมูล: {sourceLabel}</p>

          {dataSource === "mock" ? (
            <p className="mt-2 rounded-xl bg-[#F3F4F5] px-3 py-2 text-xs text-[#59413F]">
              กำลังแสดง mock เพราะ API ยังไม่พร้อม:
              {fallbackReasons.length > 0
                ? ` ${fallbackReasons.join(" | ")}`
                : " ไม่พบข้อมูลจาก API"}
            </p>
          ) : null}
        </section>

        <div className="mt-6">
          <ZoneSummaryCard summary={summary} />
        </div>

        <section className="mt-8 section-surface rounded-3xl p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="display-font text-2xl font-extrabold text-[#191C1D]">
              รายการพื้นที่ย่อย
            </h2>
            <p className="label-caps text-xs font-semibold text-[#59413F]">
              {subZones.length} areas
            </p>
          </div>

          {subZones.length === 0 ? (
            <EmptyState
              title="ยังไม่มีข้อมูลพื้นที่ย่อย"
              description="ขณะนี้ยังไม่มีข้อมูลของพื้นที่ย่อยสำหรับโซนนี้ หรือระบบยังไม่ได้รับข้อมูลล่าสุด"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {subZones.map((subZone) => (
                <SubZoneCard key={subZone.id} subZone={subZone} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="card-surface rounded-3xl p-5 md:p-6">
            <p className="label-caps text-xs font-semibold text-[#7D000F]/80">Camera Feed</p>
            <h2 className="display-font mt-2 text-2xl font-extrabold text-[#191C1D]">
              ภาพ Snapshot จากกล้อง CCTV
            </h2>
            <p className="mt-2 text-sm text-[#59413F]">
              ในขั้นนี้ยังใช้ placeholder อยู่ ก่อนจะเชื่อม snap_link จาก API
              จริงใน step ถัดไป
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl bg-[#F3F4F5]">
                <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(125,0,15,0.08),transparent_45%,rgba(119,90,25,0.08))]" />
                {cameraSummary?.snapLink ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cameraSummary.snapLink}
                    alt={`Snapshot ของโซน ${zoneId}`}
                    className="relative z-10 h-full w-full object-cover"
                  />
                ) : (
                  <p className="relative z-10 text-sm font-medium text-[#59413F]">
                    Snapshot Preview Placeholder
                  </p>
                )}
              </div>
              <div className="rounded-2xl bg-[#F3F4F5] p-4">
                <p className="label-caps text-[0.68rem] font-semibold text-[#7D000F]/80">
                  Camera Telemetry
                </p>
                <ul className="mt-3 space-y-3 text-sm text-[#59413F]">
                  <li>Source: {isC5 ? "cam_1pw709e5lwrswc5n" : `CCTV-ZONE-${zoneId}`}</li>
                  <li>FPS: 15 (mock)</li>
                  <li>Latency: 220ms (mock)</li>
                  <li>Detection: {cameraSummary ? "Updated" : "Standby"}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
