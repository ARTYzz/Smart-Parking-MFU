import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { ZoneCard } from "@/components/parking/zone-card";
import { ZoneSummaryCard } from "@/components/parking/zone-summary-card";
import { mockParkingZones } from "@/lib/mock-data";
import { buildParkingSummary } from "@/lib/summary";

export default function HomePage() {
  const zones = mockParkingZones;
  const summary = buildParkingSummary(zones);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <AppHeader />

      <PageContainer>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
            ภาพรวมสถานะที่จอดรถ
          </h2>
          <p className="mt-2 text-slate-600">
            ตรวจสอบจำนวนช่องจอดรถว่างและใช้งานแบบเรียลไทม์
            แยกตามโซนและประเภทยานพาหนะ
          </p>
        </section>

        <div className="mt-6">
          <ZoneSummaryCard summary={summary} />
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              รายการโซนทั้งหมด
            </h3>
            <p className="text-sm text-slate-500">{zones.length} โซน</p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {zones.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
