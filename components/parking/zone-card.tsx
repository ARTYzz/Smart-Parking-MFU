"use client";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { getParkingStatus } from "@/lib/occupancy";
import type { ParkingZone } from "@/types/parking";
import { StatusBadge } from "@/components/parking/status-badge";


interface ZoneCardProps {
  zone: ParkingZone;
}

export function ZoneCard({ zone }: ZoneCardProps) {
  const { t, language } = useLanguage();
  const { bookingSnapshot } = useApp();
  const bookable = bookingSnapshot.availability.find(row => row.zoneId === zone.id)?.bookable;
  const status = bookable === undefined ? zone.status : getParkingStatus(zone.hasData, zone.total-bookable, zone.total);
  const colors = { available:"#17835b", "nearly-full":"#b7780a", full:"#ba3440", "no-data":"#76808b" };
  return <Link href={`/zone/${encodeURIComponent(zone.id)}`} className="card-surface block p-5 hover:border-[#b8989d]">
    <div className="flex items-center gap-3"><strong className="rounded-xl bg-[#f8e9eb] px-3 py-2 text-[#7d000f]">{zone.id}</strong><h3 className="grow font-bold">{zone.name}</h3><StatusBadge status={status}/></div>
    <div className="my-4 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full" style={{width:`${zone.hasData ? zone.occupancyRate*100 : 0}%`, background:colors[status]}}/></div>
    <p className="text-xs text-slate-600">{t("ทั้งหมด")} {zone.total}</p>
    <div className="my-4 grid grid-cols-2 gap-2">{[[language==="th"?"ว่างทางกายภาพ":"Physically free",zone.free],[language==="th"?"พร้อมจอง":"Bookable",bookable]].map(([label,value])=><div key={label} className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-slate-600">{label}</p><strong className="text-xl">{zone.hasData ? value ?? "—" : "—"}</strong></div>)}</div>
    <span className="text-sm font-bold text-[#7d000f]">{t("ดูรายละเอียด")} →</span>
  </Link>;
}
