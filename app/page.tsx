import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { ZoneCard } from "@/components/parking/zone-card";
import { ZoneSummaryCard } from "@/components/parking/zone-summary-card";
import { mockParkingZones } from "@/lib/mock-data";
import { buildParkingSummary } from "@/lib/summary";
import { getPublicZonesOrFallback } from "@/lib/api";

export default async function HomePage() {
  const zones = await getPublicZonesOrFallback(mockParkingZones);
  const summary = buildParkingSummary(zones);
  const generatedAt = new Date().toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="min-h-screen">
      <AppHeader />

      <PageContainer>
        <section className="section-surface rounded-3xl p-6 md:p-8">
          <p className="label-caps text-xs font-semibold text-[#7D000F]/80">
            Live Campus Mobility
          </p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="display-font text-4xl font-extrabold leading-tight text-[#191C1D] md:text-5xl">
                ภาพรวมสถานะ
                <br />
                ที่จอดรถอัจฉริยะ MFU
              </h2>
              <p className="mt-3 max-w-2xl text-[#59413F]">
                ติดตามความหนาแน่นรายโซนแบบเรียลไทม์ พร้อมข้อมูลแยกตามประเภท
                ยานพาหนะ เพื่อช่วยตัดสินใจเลือกจุดจอดได้รวดเร็วขึ้น
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-4 md:p-5">
              <p className="label-caps text-[0.65rem] font-semibold text-[#7D000F]/80">
                Session Snapshot
              </p>
              <p className="display-font mt-2 text-3xl font-extrabold text-[#191C1D]">
                {summary.free}
              </p>
              <p className="text-sm text-[#59413F]">ช่องจอดว่าง ณ ปัจจุบัน</p>
              <p className="mt-4 text-xs text-[#59413F]">อัปเดตล่าสุด {generatedAt}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/find-spot"
              className="primary-cta rounded-xl px-5 py-3 text-sm font-semibold"
            >
              เริ่มค้นหาจุดจอดตอนนี้
            </Link>
            <Link
              href="/parking-zones"
              className="secondary-cta rounded-xl px-5 py-3 text-sm font-semibold"
            >
              ดูแผนที่โซนจอดรถ
            </Link>
          </div>
        </section>

        <div className="mt-6">
          <ZoneSummaryCard summary={summary} />
        </div>

        <section className="mt-8 section-surface rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="display-font text-2xl font-extrabold text-[#191C1D]">
              รายการโซนทั้งหมด
            </h3>
            <p className="label-caps text-xs font-semibold text-[#59413F]">
              {zones.length} zones
            </p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {zones.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/find-spot"
            className="card-surface rounded-3xl p-5 transition hover:-translate-y-0.5"
          >
            <p className="label-caps text-xs font-semibold text-[#7D000F]/80">Main Flow</p>
            <h3 className="display-font mt-2 text-2xl font-extrabold text-[#191C1D]">
              Quick Finder
            </h3>
            <p className="mt-2 text-sm text-[#59413F]">
              เลือกรถ เลือกโซน และรับช่องจอดแนะนำพร้อมเวลาจอง
            </p>
          </Link>

          <Link
            href="/parking-zones"
            className="card-surface rounded-3xl p-5 transition hover:-translate-y-0.5"
          >
            <p className="label-caps text-xs font-semibold text-[#7D000F]/80">Navigation</p>
            <h3 className="display-font mt-2 text-2xl font-extrabold text-[#191C1D]">
              Parking Zone Explorer
            </h3>
            <p className="mt-2 text-sm text-[#59413F]">
              เจาะรายละเอียดโซนย่อยและ snapshot สถานะล่าสุดของแต่ละพื้นที่
            </p>
          </Link>
        </section>
      </PageContainer>
    </main>
  );
}
