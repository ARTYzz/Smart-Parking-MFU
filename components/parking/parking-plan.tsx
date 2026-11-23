"use client";
import { useState } from "react";
import { CarFront, Bike, ArrowRight, Trees, LockKeyhole } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { useApp } from "@/components/providers/app-provider";
import type { ParkingSubZone } from "@/types/parking";
import Link from "next/link";

export function ParkingPlan({ slots, zoneId }: { slots: ParkingSubZone[]; zoneId: string }) {
  const { language } = useLanguage();
  const { bookingSnapshot, bookingError } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const en = language === "en";
  const tr = (th: string, english: string) => en ? english : th;
  const reserved = new Set(bookingSnapshot.availability.find(item => item.zoneId === zoneId)?.reservedSlotIds ?? []);
  const status = (slot: ParkingSubZone) => !slot.hasData || bookingError ? "unknown" : slot.occupied > 0 ? "occupied" : reserved.has(slot.id) ? "reserved" : "free";
  const labels = { free: tr("ว่าง", "Available"), occupied: tr("มีรถจอด", "Occupied"), reserved: tr("จองแล้ว", "Reserved"), unknown: tr("ไม่มีข้อมูล", "No data") };
  const tones = { free: "border-emerald-500 bg-emerald-50 text-emerald-800", occupied: "border-rose-300 bg-rose-50 text-rose-800", reserved: "border-amber-400 bg-amber-50 text-amber-900", unknown: "border-slate-300 bg-slate-100 text-slate-600" };
  const cars = slots.filter(s => s.car.free + s.car.occupied > 0);
  const bikes = slots.filter(s => !cars.includes(s));
  const referenced = zoneId === "C2";
  const layout = ({ D1: { columns: 10, angled: false }, E1: { columns: 12, angled: false }, E2: { columns: 10, angled: true }, C3: { columns: 8, angled: true }, C5: { columns: 9, angled: false }, "M-STORE": { columns: 10, angled: false } } as Record<string, {columns: number; angled: boolean}>)[zoneId] ?? {columns: 10, angled: false};
  const rowGroups = referenced ? [
    { title: tr("แถวรถยนต์ • ฝั่งแนวต้นไม้", "Cars • tree-side row"), items: cars.slice(0, Math.ceil(cars.length / 2)) },
    { title: tr("แถวรถยนต์ • ฝั่งเกาะกลาง", "Cars • island-side row"), items: cars.slice(Math.ceil(cars.length / 2)) },
    { title: tr("พื้นที่มอเตอร์ไซค์ • ฝั่งอาคาร", "Motorcycles • building side"), items: bikes },
  ].filter(row => row.items.length) : [
    ...Array.from({ length: Math.ceil(cars.length / layout.columns) }, (_, i) => ({ title: tr("รถยนต์ • แถว ", "Cars • row ") + String.fromCharCode(65 + i), items: cars.slice(i * layout.columns, (i + 1) * layout.columns) })),
    ...Array.from({ length: Math.ceil(bikes.length / layout.columns) }, (_, i) => ({ title: tr("มอเตอร์ไซค์ • แถว M", "Motorcycles • row M") + (i + 1), items: bikes.slice(i * layout.columns, (i + 1) * layout.columns) })),
  ];
  const focus = slots.find(s => s.id === selected) ?? slots[0];
  return <div className="zone-plan-layout">
  <section className="card-surface min-w-0 overflow-hidden">
    <div className="flex items-center justify-between p-5"><div><h2 className="font-bold">{tr("ผังช่องจอด", "Parking plan")}</h2><p className="mt-2 text-xs text-slate-600">{tr("เลือกช่องเพื่อดูข้อมูล", "Select a space to inspect it")}</p></div><span className="zone-icon">{zoneId}</span></div>
    <div className="flex flex-wrap items-start justify-between gap-4 bg-white p-5 md:p-6"><div><p className="text-xs font-bold tracking-widest text-[#7d000f]">{zoneId} · PARKING PLAN</p><h2 className="mt-2 text-xl font-bold">{tr("ผังช่องจอดมุมมองด้านบน", "Parking spaces · top view")}</h2><p className="mt-2 max-w-xl text-xs leading-6 text-stone-500">{referenced ? tr("ผังประมาณจากภาพ 2 มุมของลานเดียวกัน ไม่ใช่การนับจากภาพ • จำนวนและสถานะใช้ข้อมูลเดโมในระบบ ตำแหน่งแถวและช่องยังไม่ยืนยัน", "Approximation from two views of the same lot, not an image-based count. Counts and status use demo data; row and space positions are unverified.") : tr("แปลนออกแบบเพื่อสาธิต ไม่ใช่ผังสถานที่จริง • จำนวนและสถานะช่องใช้ข้อมูลของโซน ไม่ได้สุ่มสถานะ", "Concept layout, not a real site plan. Space counts and availability follow zone data; statuses are not randomized.")}</p></div><span className="rounded-full bg-[#f3eae2] px-3 py-2 text-xs font-semibold text-[#7d000f]">{slots.length} {tr("ช่องทั้งหมด", "total spaces")}</span></div>
    <div className="flex flex-wrap gap-3 border-y border-stone-200 bg-white/60 px-5 py-3">{Object.entries(labels).map(([key,label]) => <span key={key} className="flex items-center gap-1.5 text-xs text-stone-600"><span className={`h-3 w-3 rounded border-2 ${tones[key as keyof typeof tones]}`} />{label} <strong>{slots.filter(s => status(s) === key).length}</strong></span>)}</div>
    <div className="p-3 md:p-6">
      <div className="mb-4 flex items-center justify-center gap-3 rounded-2xl border border-[#c7d6b7] bg-[#e2ebd6] py-3 text-xs text-[#647950]"><Trees size={20}/>{tr("แนวต้นไม้ / พื้นที่สีเขียว", "Trees / landscaped area")}<Trees size={20}/></div>
      <div className="overflow-x-auto rounded-2xl border border-[#cbd0cf] bg-[#e4e8e6]" tabIndex={0} aria-label={tr("ผังช่องจอด เลื่อนแนวนอนเพื่อดูช่องทั้งหมด", "Parking layout. Scroll horizontally to see all spaces.")}>
        <div className="min-w-[640px] p-4">
          {!referenced && <div className="mb-4 flex items-center justify-between rounded-xl bg-[#d9dddf] px-5 py-4 text-xs font-bold text-white"><span>{tr("ทางเข้าจำลอง", "Illustrative entrance")} →</span><span>← {tr("ทางออกจำลอง", "Illustrative exit")}</span></div>}
          {rowGroups.map((row, r) => <div key={row.title}>
            {(referenced ? r === 2 : r > 0 && r % 2 === 0) && <div className="my-4 flex items-center justify-center gap-3 rounded-full border-4 border-[#bac5b0] bg-[#d5e3c5] py-2 text-xs text-[#60784f]"><Trees size={16}/>{tr("เกาะกลางพื้นที่สีเขียว", "Landscaped island")}<Trees size={16}/></div>}
            <div className="mb-3 mt-3 flex items-center justify-between text-xs font-semibold text-[#58645d]"><span>{row.title}</span><span>{row.items.length} {tr("ช่อง", "spaces")}</span></div>
            <div className="grid gap-x-1 gap-y-3" style={{ gridTemplateColumns: `repeat(${referenced ? 10 : layout.columns}, minmax(44px, 1fr))`, paddingInline: layout.angled ? 14 : 0 }}>
              {row.items.map(slot => {const state = status(slot), motorbike = slot.motorcycle.free + slot.motorcycle.occupied > 0; return <button key={slot.id} style={{ transform: layout.angled ? "skewY(-8deg)" : undefined }} type="button" aria-pressed={focus?.id === slot.id} aria-label={`${slot.id} · ${labels[state]}`} onClick={() => setSelected(slot.id)} className={`flex min-h-[60px] flex-col-reverse items-center justify-center gap-1 rounded-md border px-1 py-2 transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7d000f] ${tones[state]} ${focus?.id === slot.id ? "ring-2 ring-[#7d000f] ring-offset-2" : ""}`}>
                <span className="text-[10px] font-bold">{slot.id.replace(`${zoneId}-`, "")}</span>
                {state === "reserved" ? <LockKeyhole size={18}/> : motorbike ? <Bike size={18}/> : <CarFront size={18}/>}
              </button>; })}
            </div>
            <div className="relative my-3 flex min-h-10 items-center justify-between gap-4 overflow-hidden rounded-lg bg-[#d9dddf] px-6 text-slate-700"><div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-white/25"/><span className="relative bg-[#d9dddf] px-2 text-xs font-semibold">{tr("ถนน / ทางรถวิ่ง", "ROAD / DRIVE AISLE")}</span><span className="relative bg-[#d9dddf] px-2 text-[10px] text-slate-600">{tr("แนวทางวิ่งจำลอง", "Illustrative direction")}</span><ArrowRight size={25} className={`relative bg-[#d9dddf] ${!referenced && r % 2 ? "rotate-180" : ""}`}/></div>
          </div>)}
          <div className="flex items-center justify-between rounded-xl bg-[#d6cdc3] px-5 py-3 text-xs font-semibold text-[#796656]"><span>{tr("ฝั่งอาคาร / ทางเดินเท้า", "Building side / pedestrian walkway")}</span><span>{zoneId}</span></div>
        </div>
      </div>
    </div>
  </section>
  <aside aria-live="polite" className="card-surface self-start p-5">
    <h2 className="mb-5 font-bold">{tr("รายละเอียดช่องที่เลือก", "Selected space")}</h2>
    {focus && <>
      <div className={`inline-flex rounded-xl border p-3 ${tones[status(focus)]}`}><CarFront size={26}/></div>
      <h3 className="mt-4 text-2xl font-bold">{focus.id}</h3>
      <dl className="my-4 space-y-3 text-sm">
        <div className="flex justify-between"><dt>{tr("โซน", "Zone")}</dt><dd>{zoneId}</dd></div>
        <div className="flex justify-between"><dt>{tr("สถานะ", "Status")}</dt><dd>{labels[status(focus)]}</dd></div>
      </dl>
      <div className="data-notice">{tr("ระบบจัดช่องให้อัตโนมัติเมื่อจอง", "The system assigns a space automatically at booking.")}</div>
      <Link href={`/find-spot?zone=${encodeURIComponent(zoneId)}`} className="primary-cta mt-4 block rounded-xl p-3 text-center text-sm font-bold">{tr("ค้นหาและจอง", "Find and reserve")}</Link>
    </>}
  </aside></div>;
}
