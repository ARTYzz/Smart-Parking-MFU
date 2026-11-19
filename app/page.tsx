"use client";
import { useLanguage } from "@/components/providers/language-provider";
import { useMemo } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { ZoneCard } from "@/components/parking/zone-card";
import { ZoneSummaryCard } from "@/components/parking/zone-summary-card";
import CampusParkingMap, { type ZoneStatus } from "@/components/home/CampusParkingMap";
import { useApp } from "@/components/providers/app-provider";
import { buildParkingSummary } from "@/lib/summary";
import { parkingMode } from "@/lib/services";
import { getParkingStatus } from "@/lib/occupancy";

export default function HomePage() {
  const { t } = useLanguage();
  const { zones, loading, error, refresh, user, bookingSnapshot } = useApp();
  const summary = buildParkingSummary(zones);
  const mapZones: ZoneStatus[] = useMemo(() => zones.map(zone => {
    const availability = bookingSnapshot.availability.find(item => item.zoneId === zone.id);
    const status = availability ? getParkingStatus(zone.hasData, zone.total - availability.bookable, zone.total) : zone.status;
    return ({
    zoneId: zone.id, totalSlots: zone.total, occupiedSlots: zone.occupied,
    availableSlots: zone.free, status: status === "nearly-full" ? "nearly_full" : status,
    bookableSlots: availability?.bookable, reservedSlots: availability?.reserved,
    updatedAt: zone.timestamp,
  }); }), [zones, bookingSnapshot]);
  return <main className="min-h-screen"><AppHeader /><PageContainer>
    <section className="section-surface rounded-3xl p-6 md:p-8">
      <p className="label-caps text-sm text-[#7D000F]">{t("Smart Parking Dashboard")}</p>
      <h2 className="display-font mt-2 text-4xl font-extrabold">{t("เลือกที่จอด ก่อนออกเดินทาง")}</h2>
      <p className="mt-3 text-[#59413F]">{t(user ? `สวัสดี ${user.name}` : "สำรวจที่จอดรถในมหาวิทยาลัย")}{t(" • ")}{t(parkingMode === "mock" ? "ข้อมูลทั้งหมดเป็นสถานการณ์จำลอง" : "ข้อมูลล่าสุดที่ดึงจากระบบ")}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/find-spot" className="primary-cta rounded-xl px-5 py-3 font-semibold">{t("Book Now • จองที่จอดสาธิต")}</Link>
        <Link href="/parking-zones" className="secondary-cta rounded-xl px-5 py-3 font-semibold">{t("ดูทุกโซน")}</Link>
        <button onClick={() => void refresh()} className="rounded-xl bg-white px-5 py-3">{t("รีเฟรชข้อมูล")}</button>
      </div>
      <p className="mt-4 text-sm">{t(loading ? "กำลังโหลดข้อมูล…" : error ? "ยังโหลดข้อมูลไม่สำเร็จ" : `มีข้อมูล ${zones.filter(z => z.hasData).length}/${zones.length} โซน`)}</p>
    </section>
    {t(!loading && !error && <div className="mt-6"><ZoneSummaryCard summary={summary} /></div>)}
    <section className="section-surface mt-6 rounded-3xl p-5 md:p-8">
      <h2 className="display-font text-2xl font-bold">{t("แผนที่มหาวิทยาลัย")}</h2>
      <p className="my-3 text-sm text-[#59413F]">{t("สำรวจอาคารและเลือกโซนจอดรถ • สีแสดงช่องพร้อมจองหลังหักการจอง • ผังวาดตามภาพอ้างอิงและข้อมูลจอดยังเป็นข้อมูลสาธิต")}</p>
      <CampusParkingMap zones={mapZones} />
    </section>
    <section className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">{t("สถานะรายโซน")}</h2>
      {t(!loading && !error && zones.length === 0 && <p>{t("ยังไม่มีโซนจอดรถ")}</p>)}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{t(zones.map(zone => <ZoneCard key={zone.id} zone={zone} />))}</div>
    </section>
  </PageContainer></main>;
}
