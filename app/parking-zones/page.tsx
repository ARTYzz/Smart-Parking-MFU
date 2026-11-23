"use client";
import { useLanguage } from "@/components/providers/language-provider";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { ZoneCard } from "@/components/parking/zone-card";
import { useState } from "react";
import { getParkingStatus } from "@/lib/occupancy";
import { BackLink } from "@/components/layout/back-link";
import { useApp } from "@/components/providers/app-provider";

export default function ParkingZonesPage() {
  const { t, language } = useLanguage();
  const { zones, loading, error, bookingSnapshot } = useApp();

  const [query,setQuery] = useState("");
  const [status,setStatus] = useState("");
  const visible = zones.filter(zone => {
    const available = bookingSnapshot.availability.find(item => item.zoneId === zone.id);
    const current = available ? getParkingStatus(zone.hasData, zone.total - available.bookable, zone.total) : zone.status;
    return (!status || status === current) && (zone.id + " " + zone.name).toLowerCase().includes(query.trim().toLowerCase());
  });
  return (
    <main className="min-h-screen">
      <AppHeader />

      <PageContainer>
        <div className="mb-6">
          <BackLink href="/" label={t("กลับหน้าหลัก")} />
        </div>
        <section className="page-intro">
          <p className="label-caps text-xs font-semibold text-[#7D000F]/80">{t("Parking Zones")}</p>
          <h1 className="display-font mt-2 text-4xl font-extrabold text-[#191C1D] md:text-5xl">{t("โซนจอดรถทั้งหมด")}</h1>
          <p className="mt-3 max-w-2xl text-[#59413F]">{t("ดูภาพรวมทุกโซน พร้อมจำนวนช่องจอดว่างและสถานะ occupancy ล่าสุด")}</p>
        </section>

        <section className="mt-6">
          <div className="mb-5 flex flex-wrap gap-3"><input type="search" value={query} onChange={e=>setQuery(e.target.value)} aria-label={language==="th"?"ค้นหาโซน":"Search zones"} placeholder={language==="th"?"ค้นหาโซน เช่น C2":"Search zones, e.g. C2"} className="rounded-xl border border-gray-200 bg-white px-4 py-2"/><select aria-label={language==="th"?"สถานะ":"Status"} value={status} onChange={e=>setStatus(e.target.value)} className="rounded-xl border border-gray-200 px-3">{[["","ทุกสถานะ","All statuses"],["available","ว่าง","Available"],["nearly-full","ใกล้เต็ม","Near full"],["full","เต็ม","Full"],["no-data","ไม่มีข้อมูล","No data"]].map(([id,th,en])=><option key={id} value={id}>{language==="th"?th:en}</option>)}</select></div>
          {error && <p role="alert">{t(error)}</p>}
          {t(!loading && !error && visible.length === 0 && <p>{t("ยังไม่มีโซนจอดรถ")}</p>)}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {t(visible.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            )))}
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
