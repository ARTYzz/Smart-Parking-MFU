"use client";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Bike, CalendarClock } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { useApp } from "@/components/providers/app-provider";
import { bookingService, parkingMode } from "@/lib/services";
import type { VehicleType } from "@/types/parking";
import { demoBookingPolicies } from "@/lib/services/booking";

export function FindSpot({ initialZone }: { initialZone: string }) {
  const { t, language } = useLanguage();
  const { zones, user, loading, error, bookingSnapshot, bookingError, refresh } = useApp();
  const demo = parkingMode === "mock";
  const router = useRouter();
  const [zoneId, setZoneId] = useState(initialZone);
  const activeZoneId = zones.some((zone) => zone.id === zoneId) ? zoneId : zones[0]?.id ?? zoneId;
  const activeZone = zones.find((zone) => zone.id === activeZoneId);
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [startMode, setStartMode] = useState("now");
  const [startInput, setStartInput] = useState("");
  const [durationMinutes, setDuration] = useState(30);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const pendingRequest = useRef<{ selection: string; id: string } | null>(null);
  const [message, setMessage] = useState("");
  const parsedStart = Date.parse(startInput);
  const startsAt = startMode === "now" ? null : Number.isFinite(parsedStart) ? new Date(parsedStart).toISOString() : "invalid";
  const queryKey = `${activeZoneId}|${vehicleType}|${startsAt}|${durationMinutes}`;
  const [preview, setPreview] = useState<{ key: string; slots: string[]; error: string } | null>(null);
  const policy = demo ? (user ? bookingService.getPolicy(user.role) : null) : bookingSnapshot.policy ?? null;
  const eligible = demo || bookingSnapshot.approvedVehicleTypes?.includes(vehicleType) === true;
  const durations = [...new Set([5, 15, 30, 45, 60, 120, 180, ...(policy && policy.maxMinutes > 180 ? [policy.maxMinutes] : [])])];
  const current = preview?.key === queryKey ? preview : null;
  useEffect(() => {
    let active = true;
    if ((!demo && (!user || loading)) || startsAt === "invalid") return;
    bookingService.getAvailableSlots({ zoneId: activeZoneId, vehicleType, startsAt, durationMinutes }).then(slots => {
      if (active) setPreview({ key: queryKey, slots, error: "" });
    }).catch(error => {
      if (active) setPreview({ key: queryKey, slots: [], error: error instanceof Error ? error.message : "ตรวจช่องว่างไม่สำเร็จ" });
    });
    return () => { active = false; };
  }, [activeZoneId, vehicleType, startsAt, durationMinutes, queryKey, bookingSnapshot, demo, user, loading]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !eligible || submitting.current || !current?.slots.length) return;
    if (!window.confirm(demo ? (language === "th" ? "ยืนยันการจองที่จอดสาธิต?" : "Confirm this demo reservation?")
      : (language === "th" ? "ยืนยันการจองที่จอด?" : "Confirm this reservation?"))) return;
    submitting.current = true; setBusy(true); setMessage("");
    try {
      if (pendingRequest.current?.selection !== queryKey) pendingRequest.current = { selection: queryKey, id: crypto.randomUUID() };
      await bookingService.create({ userId: user.id, zoneId: activeZoneId, vehicleType, startsAt, durationMinutes, requestId: pendingRequest.current.id });
      pendingRequest.current = null;
      await refresh(); router.push("/my-booking");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "จองไม่สำเร็จ");
      await refresh();
    } finally { submitting.current = false; setBusy(false); }
  }
  const allowedDuration = !policy || durationMinutes <= policy.maxMinutes;
  return <main className="min-h-screen"><AppHeader /><PageContainer>
    <section className="page-intro">
      <p className="label-caps text-sm font-semibold text-[#7D000F]">{demo ? t("Quick Finder • Mock Booking") : "Find & Book"}</p>
      <h1 className="display-font mt-2 text-4xl font-bold">{t("จองที่จอดสำหรับการเดินทางของคุณ")}</h1>
      <p className="mt-3 text-[#59413F]">{demo ? t("เลือกโซนและช่วงเวลา ระบบจะจัดช่องว่างจากข้อมูลจำลองให้เมื่อยืนยัน")
        : language === "th" ? "เลือกประเภทรถ โซน และช่วงเวลาที่ต้องการจอง" : "Choose a vehicle type, a zone, and a reservation window."}</p>
      {demo && <p className="data-notice mt-5">{t("ข้อมูลบันทึกในเบราว์เซอร์นี้เท่านั้น • ไม่ใช่การจองพื้นที่จริงของมหาวิทยาลัย")}</p>}
    </section>
      {t(!loading && !user && <p className="mt-5 rounded-xl bg-amber-50 p-4"><Link className="font-semibold underline" href="/login">{t("เลือกบัญชีสาธิต")}</Link>{t(" ก่อนยืนยันการจอง คุณยังสำรวจช่องว่างได้")}</p>)}
      {!demo && !loading && bookingError && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-900">
        {t(bookingError)} <button type="button" className="underline" onClick={() => void refresh()}>{t("ลองใหม่")}</button>
      </p>}
      {!demo && user && !loading && bookingSnapshot.approvedVehicleTypes && !eligible && <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
        {language === "th" ? "ก่อนจอง ต้องลงทะเบียนรถประเภทที่เลือกและได้รับอนุมัติแล้ว" : "Register a vehicle of the selected type and obtain approval before booking."}{" "}
        <Link href="/my-vehicle" className="font-semibold underline">{language === "th" ? "ไปที่รถของฉัน" : "Go to My Vehicles"}</Link>
      </p>}
      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <fieldset disabled={busy || loading} className="min-w-0 space-y-5 disabled:opacity-60">
          <legend className="sr-only">{t("รายละเอียดการจอง")}</legend>
          <section className="card-surface rounded-3xl p-5 md:p-6">
            <h2 className="text-xl font-bold">{t("1. ประเภทรถ")}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">{t((["car", "motorcycle"] as const).map(type => {
              const Icon = type === "car" ? Car : Bike;
              return <button key={type} type="button" aria-pressed={vehicleType === type} onClick={() => setVehicleType(type)} className={`flex items-center gap-3 rounded-xl border p-4 text-left font-semibold ${vehicleType === type ? "border-[#7D000F] bg-[#fdf6f7] text-[#7D000F]" : "border-[#e8eaee] text-slate-600"}`}><Icon className="h-5 w-5 shrink-0" />{t(type === "car" ? "รถยนต์" : "มอเตอร์ไซค์")}</button>;
            }))}</div>
            <label className="mt-5 block font-semibold" htmlFor="booking-zone">{t("2. โซนที่ต้องการ")}</label>
            <select id="booking-zone" value={activeZoneId} onChange={e => setZoneId(e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3">
              {t(zones.map(zone => <option key={zone.id} value={zone.id}>{t(zone.name)}{t(!zone.hasData ? " — ไม่มีข้อมูล" : "")}</option>))}
            </select>
            {t(error && <p role="alert">{t(error)}</p>)}
            <h2 className="mt-6 flex items-center gap-2 text-xl font-bold"><CalendarClock className="h-5 w-5" />{t("3. ช่วงเวลาจอง")}</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              <label className="flex items-center gap-2"><input type="radio" name="start-mode" checked={startMode === "now"} onChange={() => setStartMode("now")} />{t("เริ่มตอนนี้")}</label>
              <label className="flex items-center gap-2"><input type="radio" name="start-mode" checked={startMode === "later"} onChange={() => setStartMode("later")} />{t("จองล่วงหน้า")}</label>
            </div>
            {t(startMode === "later" && <label className="mt-4 block">{t("วันและเวลาเริ่ม (ตามเวลาของอุปกรณ์)")}<input aria-label={t("วันและเวลาเริ่ม")} required type="datetime-local" value={startInput} onChange={e => setStartInput(e.target.value)} className="mt-2 block w-full rounded-xl border p-3" /></label>)}
            <label className="mt-4 block" htmlFor="booking-duration">{t("ระยะเวลาจอง")}</label>
            <select id="booking-duration" value={durationMinutes} onChange={e => setDuration(Number(e.target.value))} className="mt-2 w-full rounded-xl border bg-white p-3">{t(durations.map(minutes => <option key={minutes} value={minutes} disabled={Boolean(policy && minutes > policy.maxMinutes)}>{t(minutes)}{t(" นาที")}</option>))}</select>
            {t(!allowedDuration && <p role="alert" className="mt-2 text-red-800">{t("กรุณาเลือกระยะเวลาไม่เกิน ")}{t(policy?.maxMinutes)}{t(" นาทีสำหรับบัญชีนี้")}</p>)}
          </section>
        </fieldset>
        <aside className="space-y-5">
          <section className="card-surface rounded-3xl p-6">
            <p className="label-caps text-sm text-[#7D000F]">{t("ตรวจช่องว่าง")}</p>
            <h2 className="mt-2 text-2xl font-bold">{t("โซน ")}{t(activeZoneId)}</h2>
            <p className="mt-3 text-sm">{t(vehicleType === "car" ? "รถยนต์" : "มอเตอร์ไซค์")}{t(" • ")}{t(durationMinutes)}{t(" นาที • ")}{t(startMode === "now" ? "เริ่มเมื่อยืนยัน" : "ช่วงเวลาที่เลือก")}</p>
            <div className="my-5 rounded-2xl bg-[#F3F4F5] p-5" aria-live="polite">{t(startsAt === "invalid" ? "เลือกวันและเวลาเริ่ม" : !current ? "กำลังตรวจช่องว่าง…" : current.error ? current.error : <><strong className="text-4xl text-[#7D000F]">{t(current.slots.length)}</strong><span className="ml-2">{t("ช่องพร้อมจองในช่วงนี้")}</span></>)}</div>
            {!demo && activeZone && !activeZone.hasData && <p className="mb-3 text-sm text-amber-900">
              {language === "th" ? "โซนนี้ยังไม่มีข้อมูลช่องจอดล่าสุดจากกล้อง" : "This zone has no recent camera data for its parking spaces."}
            </p>}
            <p className="text-sm text-[#59413F]">{t("หมายเลขช่องจะกำหนดเมื่อยืนยัน โดยตรวจการจองทับซ้ำอีกครั้ง")}</p>
            <button disabled={!user || !eligible || busy || loading || !current?.slots.length || !allowedDuration} className="primary-cta mt-5 w-full rounded-xl px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50">{busy ? t("กำลังยืนยัน…") : demo ? t("ยืนยันการจองสาธิต") : language === "th" ? "ยืนยันการจอง" : "Confirm booking"}</button>
            {t(message && <p role="alert" className="mt-3 text-red-800">{t(message)}</p>)}
            <Link href="/my-booking" className="mt-4 block text-center underline">{t("ดูการจองของฉัน")}</Link>
          </section>
          <section className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-950">
            <h2 className="font-bold">{demo ? t("นโยบายสาธิต — ยังไม่ใช่นโยบายมหาวิทยาลัย") : language === "th" ? "เงื่อนไขการจอง" : "Booking limits"}</h2>
            {t(policy ? <p className="mt-3">{t("บัญชี ")}{user?.name}{t(": มีการจองที่ยังไม่สิ้นสุดได้ ")}{t(policy.maxActiveBookings)}{t(" รายการ ครั้งละไม่เกิน ")}{t(policy.maxMinutes)}{t(" นาที และเริ่มล่วงหน้าได้ ")}{t(policy.advanceHours)}{t(" ชั่วโมง")}</p> : demo && <ul className="mt-3 space-y-2">{t(Object.values(demoBookingPolicies).map(p => <li key={p.role}>{t(p.role)}{t(": ")}{t(p.maxActiveBookings)}{t(" รายการ / ")}{t(p.maxMinutes)}{t(" นาที / ล่วงหน้า ")}{t(p.advanceHours)}{t(" ชม.")}</li>))}</ul>)}
            <p className="mt-3">{t("ทุกบทบาทจองเวลาทับกันไม่ได้ ขั้นต่ำ 5 นาที ยกเลิกได้ก่อนสิ้นสุดการจอง")}</p>
            {demo && <p className="mt-3">{t("เดโมถือว่าสถานะรถจอดอยู่คงที่ตลอดช่วงที่เลือก การจองอนาคตไม่ลดจำนวนพร้อมจองตอนนี้จนกว่าจะถึงเวลา")}</p>}
          </section>
        </aside>
      </form>
  </PageContainer></main>;
}
