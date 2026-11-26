"use client";
import { useLanguage } from "@/components/providers/language-provider";
import { useMemo } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";

import CampusParkingMap, { type ZoneStatus } from "@/components/home/CampusParkingMap";
import { useApp } from "@/components/providers/app-provider";
import { buildParkingSummary } from "@/lib/summary";
import { parkingMode } from "@/lib/services";
import { Building2, CarFront, Check, Ticket, Info } from "lucide-react";
import { StatusBadge } from "@/components/parking/status-badge";
import { getParkingStatus } from "@/lib/occupancy";

export default function HomePage() {
  const { t, language } = useLanguage();
  const { zones, loading, error, refresh, user, bookingSnapshot } = useApp();
  const summary = buildParkingSummary(zones);
  const mapZones: ZoneStatus[] = useMemo(() => zones.map(zone => {
    const availability = bookingSnapshot.availability.find(item => item.zoneId === zone.id);
    const status = availability
      ? getParkingStatus(zone.hasData && (zone.skipped === 0 || availability.bookable > 0), zone.total - availability.bookable, zone.total)
      : zone.status;
    return ({
    zoneId: zone.id, totalSlots: zone.total, occupiedSlots: zone.occupied,
    availableSlots: zone.free, status: status === "nearly-full" ? "nearly_full" : status,
    bookableSlots: availability?.bookable, reservedSlots: availability?.reserved,
    updatedAt: zone.timestamp,
  }); }), [zones, bookingSnapshot]);
  const known = zones.filter(z => z.hasData);
  const booked = bookingSnapshot.availability.filter(item => known.some(z => z.id === item.zoneId));
  const kpis = [
    ["ช่องจอดทั้งหมด", "Capacity", summary.total],
    ["มีรถจอด", "Occupied", known.length ? summary.occupied : "—"],
    ["ว่างทางกายภาพ", "Physically free", known.length ? summary.free : "—"],
    ["พร้อมจองตอนนี้", "Bookable now", booked.length ? booked.reduce((sum, row) => sum + row.bookable, 0) : "—"],
  ];
  return <main className="min-h-screen"><AppHeader /><PageContainer>
    <div className="page-intro"><p>OVERVIEW</p><h1>{language === "th" ? "ภาพรวมที่จอด" : "Parking overview"}</h1><span>{user?.name}</span></div>
    <section className="campus-hero rounded-2xl p-6 md:p-8">
      <p className="label-caps text-sm text-[#7D000F]">{t("Smart Parking Dashboard")}</p>
      <h2 className="display-font mt-2 text-4xl font-extrabold">{t("เลือกที่จอด ก่อนออกเดินทาง")}</h2>
      <p className="mt-3 text-[#59413F]">{t("สำรวจที่จอดรถในมหาวิทยาลัย")}{t(" • ")}{t(parkingMode === "mock" ? "ข้อมูลทั้งหมดเป็นสถานการณ์จำลอง" : "ข้อมูลล่าสุดที่ดึงจากระบบ")}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/find-spot" className="primary-cta rounded-xl px-5 py-3 font-semibold">{parkingMode === "mock" ? t("Book Now • จองที่จอดสาธิต") : t("จองที่จอด")}</Link>
        <Link href="/parking-zones" className="secondary-cta rounded-xl px-5 py-3 font-semibold">{t("ดูทุกโซน")}</Link>
        <button onClick={() => void refresh()} className="rounded-xl bg-white px-5 py-3">{t("รีเฟรชข้อมูล")}</button>
      </div>
      <p className="mt-4 text-sm">{t(loading ? "กำลังโหลดข้อมูล…" : error ? "ยังโหลดข้อมูลไม่สำเร็จ" : `มีข้อมูล ${zones.filter(z => z.hasData).length}/${zones.length} โซน`)}</p>
    </section>
    {t(!loading && !error && <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">{kpis.map(([th,en,value],index) => { const Icon = [Building2,CarFront,Check,Ticket][index]; return <article key={en} className="card-surface p-5"><p className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600">{language === "th" ? th : en}<Icon size={18} className="text-[#775a19]"/></p><strong className="mt-4 block text-3xl tabular-nums">{value}</strong></article>; })}</div>)}
    <div className="data-notice my-5"><Info size={16}/>{t(parkingMode === "mock" ? "ข้อมูลที่จอดสาธิต • ไม่ใช่สถานะจริง" : "ข้อมูลที่จอดจาก API")}</div>
    <div className="dashboard-panels">
      <section className="card-surface min-w-0 p-5">
        <h2 className="font-bold">{t("แผนที่มหาวิทยาลัย")}</h2>
        <div className="mt-4"><CampusParkingMap zones={mapZones} showSidebar={false} /></div>
      </section>
      <section className="card-surface p-5">
        <h2 className="font-bold">{t("สถานะรายโซน")}</h2>
        <div className="mt-3 divide-y divide-[#e8eaee]">{mapZones.map(zone => <Link key={zone.zoneId} href={`/zone/${encodeURIComponent(zone.zoneId)}`} className="flex items-center gap-3 py-3">
          <strong className="zone-icon">{zone.zoneId}</strong>
          <span className="grow text-xs">{language === "th" ? "พร้อมจอง" : "Bookable"} {zone.status === "no-data" ? "—" : zone.bookableSlots ?? "—"} / {zone.totalSlots}</span>
          <StatusBadge status={zone.status === "nearly_full" ? "nearly-full" : zone.status}/>
        </Link>)}</div>
      </section>
    </div>
  </PageContainer></main>;
}
