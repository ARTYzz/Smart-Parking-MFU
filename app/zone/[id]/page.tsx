import { AppHeader } from "@/components/layout/app-header";
import { BackLink } from "@/components/layout/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/parking/empty-state";
import { SubZoneCard } from "@/components/parking/subzone-card";
import { ZoneSummaryCard } from "@/components/parking/zone-summary-card";
import { getMockParkingDetailsByZone } from "@/lib/detail";
import { buildParkingSummary } from "@/lib/summary";

interface ZoneDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ZoneDetailPage({ params }: ZoneDetailPageProps) {
  const { id } = await params;
  const subZones = getMockParkingDetailsByZone(id);
  const summary = buildParkingSummary(subZones);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <AppHeader />

      <PageContainer>
        <div className="mb-6">
          <BackLink href="/" label="กลับหน้าหลัก" />
        </div>

        <section>
          <p className="text-sm font-medium text-blue-600">รายละเอียดโซน</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">โซน {id}</h1>
          <p className="mt-2 text-slate-600">
            ตรวจสอบข้อมูลพื้นที่ย่อยภายในโซนนี้
            พร้อมจำนวนช่องจอดว่างและใช้งานแยกตามประเภทยานพาหนะ
          </p>
        </section>

        <div className="mt-6">
          <ZoneSummaryCard summary={summary} />
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              รายการพื้นที่ย่อย
            </h2>
            <p className="text-sm text-slate-500">{subZones.length} พื้นที่</p>
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
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              ภาพ Snapshot จากกล้อง CCTV
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              ในขั้นนี้ยังใช้ placeholder อยู่ ก่อนจะเชื่อม snap_link จาก API
              จริงใน step ถัดไป
            </p>

            <div className="mt-4 flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
              Snapshot Preview Placeholder
            </div>
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
