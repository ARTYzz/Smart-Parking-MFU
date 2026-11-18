"use client";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Bike, CalendarClock } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { useApp } from "@/components/providers/app-provider";
import { bookingEnabled, bookingService } from "@/lib/services";
import type { VehicleType } from "@/types/parking";
import { demoBookingPolicies } from "@/lib/services/booking";

export default function FindSpotPage() {
  const { t } = useLanguage();
  const { zones, user, loading, error, bookingSnapshot, refresh } = useApp();
  const router = useRouter();
  const [zoneId, setZoneId] = useState("E1");
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [startMode, setStartMode] = useState("now");
  const [startInput, setStartInput] = useState("");
  const [durationMinutes, setDuration] = useState(30);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [message, setMessage] = useState("");
  const parsedStart = Date.parse(startInput);
  const startsAt = startMode === "now" ? null : Number.isFinite(parsedStart) ? new Date(parsedStart).toISOString() : "invalid";
  const queryKey = `${zoneId}|${vehicleType}|${startsAt}|${durationMinutes}`;
  const [preview, setPreview] = useState<{ key: string; slots: string[]; error: string } | null>(null);
  const policy = user ? bookingService.getPolicy(user.role) : null;
  const current = preview?.key === queryKey ? preview : null;
  useEffect(() => {
    if (!bookingEnabled) return;
    let active = true;
    bookingService.getAvailableSlots({ zoneId, vehicleType, startsAt, durationMinutes }).then(slots => {
      if (active) setPreview({ key: queryKey, slots, error: "" });
    }).catch(error => {
      if (active) setPreview({ key: queryKey, slots: [], error: error instanceof Error ? error.message : "ตรวจช่องว่างไม่สำเร็จ" });
    });
    return () => { active = false; };
  }, [zoneId, vehicleType, startsAt, durationMinutes, queryKey, bookingSnapshot]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || submitting.current) return;
    submitting.current = true; setBusy(true); setMessage("");
    try {
      await bookingService.create({ userId: user.id, zoneId, vehicleType, startsAt, durationMinutes });
      await refresh(); router.push("/my-booking");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "จองไม่สำเร็จ");
      await refresh();
    } finally { submitting.current = false; setBusy(false); }
  }
  const allowedDuration = !policy || durationMinutes <= policy.maxMinutes;
  return <main className="min-h-screen"><AppHeader /><PageContainer>
    <section className="section-surface rounded-3xl p-6 md:p-8">
      <p className="label-caps text-sm font-semibold text-[#7D000F]">{t("Quick Finder • Mock Booking")}</p>
      <h1 className="display-font mt-2 text-4xl font-bold">{t("จองที่จอดสำหรับการเดินทางของคุณ")}</h1>
      <p className="mt-3 text-[#59413F]">{t("เลือกโซนและช่วงเวลา ระบบจะจัดช่องว่างจากข้อมูลจำลองให้เมื่อยืนยัน")}</p>
      <p className="mt-2 text-sm">{t("ข้อมูลบันทึกในเบราว์เซอร์นี้เท่านั้น • ไม่ใช่การจองพื้นที่จริงของมหาวิทยาลัย")}</p>
    </section>
    {t(!bookingEnabled ? <p className="mt-6">{t("รอเชื่อมบริการจองจริง โหมดปัจจุบันไม่เปิดการจองจำลอง")}</p> : <>
      {t(!loading && !user && <p className="mt-5 rounded-xl bg-amber-50 p-4"><Link className="font-semibold underline" href="/login">{t("เลือกบัญชีสาธิต")}</Link>{t(" ก่อนยืนยันการจอง คุณยังสำรวจช่องว่างได้")}</p>)}
      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <fieldset disabled={busy || loading} className="min-w-0 space-y-5 disabled:opacity-60">
          <legend className="sr-only">{t("รายละเอียดการจอง")}</legend>
          <section className="card-surface rounded-3xl p-5 md:p-6">
            <h2 className="text-xl font-bold">{t("1. ประเภทรถ")}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">{t((["car", "motorcycle"] as const).map(type => {
              const Icon = type === "car" ? Car : Bike;
              return <button key={type} type="button" aria-pressed={vehicleType === type} onClick={() => setVehicleType(type)} className={`rounded-2xl p-5 text-left ${vehicleType === type ? "bg-[#7D000F] text-white" : "bg-[#F3F4F5]"}`}><Icon className="mb-3 h-7 w-7" />{t(type === "car" ? "รถยนต์" : "มอเตอร์ไซค์")}</button>;
            }))}</div>
            <label className="mt-5 block font-semibold" htmlFor="booking-zone">{t("2. โซนที่ต้องการ")}</label>
            <select id="booking-zone" value={zoneId} onChange={e => setZoneId(e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3">
              {t(zones.map(zone => <option key={zone.id} value={zone.id}>{t(zone.name)}{t(!zone.hasData ? " — ไม่มีข้อมูล" : "")}</option>))}
            </select>
            {t(error && <p role="alert">{t(error)}</p>)}
          </section>
          <section className="card-surface rounded-3xl p-5 md:p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold"><CalendarClock className="h-5 w-5" />{t("3. ช่วงเวลาจอง")}</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              <label className="flex items-center gap-2"><input type="radio" name="start-mode" checked={startMode === "now"} onChange={() => setStartMode("now")} />{t("เริ่มตอนนี้")}</label>
              <label className="flex items-center gap-2"><input type="radio" name="start-mode" checked={startMode === "later"} onChange={() => setStartMode("later")} />{t("จองล่วงหน้า")}</label>
            </div>
            {t(startMode === "later" && <label className="mt-4 block">{t("วันและเวลาเริ่ม (ตามเวลาของอุปกรณ์)")}<input aria-label={t("วันและเวลาเริ่ม")} required type="datetime-local" value={startInput} onChange={e => setStartInput(e.target.value)} className="mt-2 block w-full rounded-xl border p-3" /></label>)}
            <label className="mt-4 block" htmlFor="booking-duration">{t("ระยะเวลาจอง")}</label>
            <select id="booking-duration" value={durationMinutes} onChange={e => setDuration(Number(e.target.value))} className="mt-2 w-full rounded-xl border bg-white p-3">{t([5, 15, 30, 60, 120, 180].map(minutes => <option key={minutes} value={minutes} disabled={Boolean(policy && minutes > policy.maxMinutes)}>{t(minutes)}{t(" นาที")}</option>))}</select>
            {t(!allowedDuration && <p role="alert" className="mt-2 text-red-800">{t("กรุณาเลือกระยะเวลาไม่เกิน ")}{t(policy?.maxMinutes)}{t(" นาทีสำหรับบัญชีนี้")}</p>)}
          </section>
        </fieldset>
        <aside className="space-y-5">
          <section className="card-surface rounded-3xl p-6">
            <p className="label-caps text-sm text-[#7D000F]">{t("ตรวจช่องว่าง")}</p>
            <h2 className="mt-2 text-2xl font-bold">{t("โซน ")}{t(zoneId)}</h2>
            <p className="mt-3 text-sm">{t(vehicleType === "car" ? "รถยนต์" : "มอเตอร์ไซค์")}{t(" • ")}{t(durationMinutes)}{t(" นาที • ")}{t(startMode === "now" ? "เริ่มเมื่อยืนยัน" : "ช่วงเวลาที่เลือก")}</p>
            <div className="my-5 rounded-2xl bg-[#F3F4F5] p-5" aria-live="polite">{t(!current ? "กำลังตรวจช่องว่าง…" : current.error ? current.error : <><strong className="text-4xl text-[#7D000F]">{t(current.slots.length)}</strong><span className="ml-2">{t("ช่องพร้อมจองในช่วงนี้")}</span></>)}</div>
            <p className="text-sm text-[#59413F]">{t("หมายเลขช่องจะกำหนดเมื่อยืนยัน โดยตรวจการจองทับซ้ำอีกครั้ง")}</p>
            <button disabled={!user || busy || loading || !current?.slots.length || !allowedDuration} className="primary-cta mt-5 w-full rounded-xl px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50">{t(busy ? "กำลังยืนยัน…" : "ยืนยันการจองสาธิต")}</button>
            {t(message && <p role="alert" className="mt-3 text-red-800">{t(message)}</p>)}
            <Link href="/my-booking" className="mt-4 block text-center underline">{t("ดูการจองของฉัน")}</Link>
          </section>
          <section className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-950">
            <h2 className="font-bold">{t("นโยบายสาธิต — ยังไม่ใช่นโยบายมหาวิทยาลัย")}</h2>
            {t(policy ? <p className="mt-3">{t("บัญชี ")}{user?.name}{t(": มีการจองที่ยังไม่สิ้นสุดได้ ")}{t(policy.maxActiveBookings)}{t(" รายการ ครั้งละไม่เกิน ")}{t(policy.maxMinutes)}{t(" นาที และเริ่มล่วงหน้าได้ ")}{t(policy.advanceHours)}{t(" ชั่วโมง")}</p> : <ul className="mt-3 space-y-2">{t(Object.values(demoBookingPolicies).map(p => <li key={p.role}>{t(p.role)}{t(": ")}{t(p.maxActiveBookings)}{t(" รายการ / ")}{t(p.maxMinutes)}{t(" นาที / ล่วงหน้า ")}{t(p.advanceHours)}{t(" ชม.")}</li>))}</ul>)}
            <p className="mt-3">{t("ทุกบทบาทจองเวลาทับกันไม่ได้ ขั้นต่ำ 5 นาที ยกเลิกได้ก่อนสิ้นสุดการจอง")}</p>
            <p className="mt-3">{t("เดโมถือว่าสถานะรถจอดอยู่คงที่ตลอดช่วงที่เลือก การจองอนาคตไม่ลดจำนวนพร้อมจองตอนนี้จนกว่าจะถึงเวลา")}</p>
          </section>
        </aside>
      </form>
    </>)}
  </PageContainer></main>;
}
