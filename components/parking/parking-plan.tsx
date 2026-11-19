"use client";
import { useState } from "react";
import { CarFront, Bike, ArrowRight, Trees, X, LockKeyhole } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { useApp } from "@/components/providers/app-provider";
import type { ParkingSubZone } from "@/types/parking";
import { parkingMode } from "@/lib/services";

function CarDrawing() {
  return <svg viewBox="0 0 44 82" className="h-16 w-9 drop-shadow-md" aria-hidden="true"><rect x="3" y="22" width="38" height="7" rx="2" fill="#26323b"/><rect x="7" y="3" width="30" height="75" rx="11" fill="#52616c" stroke="#26323b" strokeWidth="2"/><path d="M12 20 Q22 14 32 20 L30 32 H14Z" fill="#c0d8df"/><rect x="13" y="35" width="18" height="24" rx="4" fill="#34434e"/><path d="M13 63 H31 L32 69 Q22 73 12 69Z" fill="#b6cbd0"/><rect x="11" y="6" width="7" height="3" rx="1" fill="#ffe7aa"/><rect x="27" y="6" width="6" height="3" rx="1" fill="#ffe7aa"/><path d="M11 75 H17 M27 75 H33" stroke="#ed9b9b" strokeWidth="2"/></svg>;
}
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
  const focus = slots.find(s => s.id === selected);
  const plate = (slot: ParkingSubZone) => parkingMode === "mock" ? `DEMO-${String(slots.indexOf(slot) + 1).padStart(3, "0")}` : tr("ไม่มีข้อมูลทะเบียน", "Plate unavailable");
  return <section className="overflow-hidden rounded-3xl border border-[#deded6] bg-[#f5f5ee]">
    <div className="flex flex-wrap items-start justify-between gap-4 bg-white p-5 md:p-6"><div><p className="text-xs font-bold tracking-widest text-[#7d000f]">{zoneId} · PARKING PLAN</p><h2 className="mt-2 text-xl font-bold">{tr("ผังช่องจอดมุมมองด้านบน", "Parking spaces · top view")}</h2><p className="mt-2 max-w-xl text-xs leading-6 text-stone-500">{referenced ? tr("ผังประมาณจากภาพ 2 มุมของลานเดียวกัน ไม่ใช่การนับจากภาพ • จำนวนและสถานะใช้ข้อมูลเดโมในระบบ ตำแหน่งแถวและช่องยังไม่ยืนยัน", "Approximation from two views of the same lot, not an image-based count. Counts and status use demo data; row and space positions are unverified.") : tr("แปลนออกแบบเพื่อสาธิต ไม่ใช่ผังสถานที่จริง • จำนวนและสถานะช่องใช้ข้อมูลของโซน ไม่ได้สุ่มสถานะ", "Concept layout, not a real site plan. Space counts and availability follow zone data; statuses are not randomized.")}</p></div><span className="rounded-full bg-[#f3eae2] px-3 py-2 text-xs font-semibold text-[#7d000f]">{slots.length} {tr("ช่องทั้งหมด", "total spaces")}</span></div>
    <div className="flex flex-wrap gap-3 border-y border-stone-200 bg-white/60 px-5 py-3">{Object.entries(labels).map(([key,label]) => <span key={key} className="flex items-center gap-1.5 text-xs text-stone-600"><span className={`h-3 w-3 rounded border-2 ${tones[key as keyof typeof tones]}`} />{label} <strong>{slots.filter(s => status(s) === key).length}</strong></span>)}</div>
    <div className="p-3 md:p-6">
      <div className="mb-4 flex items-center justify-center gap-3 rounded-2xl border border-[#c7d6b7] bg-[#e2ebd6] py-3 text-xs text-[#647950]"><Trees size={20}/>{tr("แนวต้นไม้ / พื้นที่สีเขียว", "Trees / landscaped area")}<Trees size={20}/></div>
      <div className="overflow-x-auto rounded-2xl border border-[#cbd0cf] bg-[#e4e8e6]" tabIndex={0} aria-label={tr("ผังช่องจอด เลื่อนแนวนอนเพื่อดูช่องทั้งหมด", "Parking layout. Scroll horizontally to see all spaces.")}>
        <div className="min-w-[760px] p-4">
          {!referenced && <div className="mb-4 flex items-center justify-between rounded-xl bg-[#606a70] px-5 py-4 text-xs font-bold text-white"><span>{tr("ทางเข้าจำลอง", "Illustrative entrance")} →</span><span>← {tr("ทางออกจำลอง", "Illustrative exit")}</span></div>}
          {rowGroups.map((row, r) => <div key={row.title}>
            {(referenced ? r === 2 : r > 0 && r % 2 === 0) && <div className="my-4 flex items-center justify-center gap-3 rounded-full border-4 border-[#bac5b0] bg-[#d5e3c5] py-2 text-xs text-[#60784f]"><Trees size={16}/>{tr("เกาะกลางพื้นที่สีเขียว", "Landscaped island")}<Trees size={16}/></div>}
            <div className="mb-3 mt-3 flex items-center justify-between text-xs font-semibold text-[#58645d]"><span>{row.title}</span><span>{row.items.length} {tr("ช่อง", "spaces")}</span></div>
            <div className="grid gap-x-1 gap-y-3" style={{ gridTemplateColumns: `repeat(${referenced ? 10 : layout.columns}, minmax(64px, 1fr))`, paddingInline: layout.angled ? 14 : 0 }}>
              {row.items.map(slot => {const state = status(slot), motorbike = slot.motorcycle.free + slot.motorcycle.occupied > 0; return <button key={slot.id} style={{ transform: layout.angled ? "skewY(-8deg)" : undefined }} type="button" aria-pressed={selected === slot.id} aria-label={`${slot.id} · ${labels[state]}`} onClick={() => setSelected(slot.id)} className={`relative flex min-h-40 flex-col items-center justify-between rounded-t-xl rounded-b-md border-x-[3px] border-t-[3px] border-b-0 px-1 pb-4 pt-2 transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7d000f] ${tones[state]} ${selected === slot.id ? "ring-2 ring-[#7d000f] ring-offset-2" : ""}`}>
                <span className="text-[10px] font-bold">{slot.id.replace(`${zoneId}-`, "")}</span>
                {state === "occupied" ? motorbike ? <Bike size={38} className="text-slate-600"/> : <CarDrawing/> : state === "reserved" ? <LockKeyhole size={25}/> : motorbike ? <Bike size={28} className="opacity-55"/> : <CarFront size={28} className="opacity-55"/>}
                <span className="text-[10px] font-semibold">{state === "occupied" ? plate(slot) : labels[state]}</span>
                <span className="absolute bottom-1 h-1 w-8 rounded-full bg-current opacity-35"/>
              </button>; })}
            </div>
            <div className="relative my-3 flex min-h-20 items-center justify-between gap-4 overflow-hidden rounded-lg bg-[#606a70] px-6 text-white"><div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-white/25"/><span className="relative bg-[#606a70] px-2 text-xs font-semibold">{tr("ถนน / ทางรถวิ่ง", "ROAD / DRIVE AISLE")}</span><span className="relative bg-[#606a70] px-2 text-[10px] text-white/70">{tr("แนวทางวิ่งจำลอง", "Illustrative direction")}</span><ArrowRight size={25} className={`relative bg-[#606a70] ${!referenced && r % 2 ? "rotate-180" : ""}`}/></div>
          </div>)}
          <div className="flex items-center justify-between rounded-xl bg-[#d6cdc3] px-5 py-3 text-xs font-semibold text-[#796656]"><span>{tr("ฝั่งอาคาร / ทางเดินเท้า", "Building side / pedestrian walkway")}</span><span>{zoneId}</span></div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-6 text-stone-500">{tr("เลื่อนซ้าย–ขวาบนมือถือ • แตะช่องเพื่อดูรายละเอียด • DEMO คือทะเบียนสมมติ ไม่ใช่ทะเบียนที่อ่านจากภาพหรือข้อมูลผู้ใช้", "Scroll horizontally on mobile • Select a space for details • DEMO plates are fictional, not camera readings or user data.")}</p>
    </div>
    <div aria-live="polite" className="border-t border-stone-200 bg-white p-5">{focus ? <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-bold text-[#7d000f]">{focus.id} · {labels[status(focus)]}</p><p className="mt-1 text-xs text-stone-500">{focus.motorcycle.free + focus.motorcycle.occupied > 0 ? tr("ช่องมอเตอร์ไซค์", "Motorcycle space") : tr("ช่องรถยนต์", "Car space")}{status(focus) === "occupied" ? ` · ${plate(focus)}` : ""}{reserved.has(focus.id) ? ` · ${tr("มีการจองช่วงปัจจุบัน", "Reserved for the current period")}` : ""}</p></div><button type="button" aria-label={tr("ปิดรายละเอียดช่อง", "Close space details")} onClick={() => setSelected(null)} className="rounded-full bg-stone-100 p-2"><X size={17}/></button></div> : <p className="text-sm text-stone-500">{tr("เลือกช่องจอดเพื่อดูรหัสและสถานะ", "Select a space to view its ID and status")}</p>}</div>
  </section>;
}
