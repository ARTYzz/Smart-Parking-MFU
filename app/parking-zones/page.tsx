import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { ZoneCard } from "@/components/parking/zone-card";
import { mockParkingZones } from "@/lib/mock-data";
import { BackLink } from "@/components/layout/back-link";
import { getPublicZonesOrFallback } from "@/lib/api";

export default async function ParkingZonesPage() {
  const zones = await getPublicZonesOrFallback(mockParkingZones);

  return (
    <main className="min-h-screen">
      <AppHeader />

      <PageContainer>
        <div className="mb-6">
          <BackLink href="/" label="กลับหน้าหลัก" />
        </div>
        <section className="section-surface rounded-3xl p-6 md:p-8">
          <p className="label-caps text-xs font-semibold text-[#7D000F]/80">Parking Zones</p>
          <h1 className="display-font mt-2 text-4xl font-extrabold text-[#191C1D] md:text-5xl">
            โซนจอดรถทั้งหมด
          </h1>
          <p className="mt-3 max-w-2xl text-[#59413F]">
            ดูภาพรวมทุกโซน พร้อมจำนวนช่องจอดว่างและสถานะ occupancy ล่าสุด
          </p>
        </section>

        <section className="mt-6 section-surface rounded-3xl p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {zones.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
