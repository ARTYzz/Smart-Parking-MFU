"use client";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { bookingEnabled, bookingService } from "@/lib/services";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";

const formatDate = (value: string) => new Date(value).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
function countdown(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(seconds / 3600).toString().padStart(2, "0")}:${Math.floor(seconds % 3600 / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
export function BookingList({ history = false }: { history?: boolean }) {
  const { user, loading, bookingSnapshot, bookingError, now, refresh } = useApp();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const mine = bookingSnapshot.bookings.filter(b => b.userId === user?.id);
  const bookings = mine.filter(b => history || b.status === "confirmed").sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const events = bookingSnapshot.events.filter(e => e.userId === user?.id).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  async function cancel(id: string) {
    if (!user) return;
    setBusy(id); setMessage("");
    try { await bookingService.cancel(id, user.id); setMessage("ยกเลิกแล้ว ช่องพร้อมจองสำหรับช่วงเวลานี้อีกครั้ง"); }
    catch (error) { setMessage(error instanceof Error ? error.message : "ยกเลิกไม่สำเร็จ"); }
    finally { await refresh(); setBusy(null); }
  }
  return <main><AppHeader /><PageContainer>
    <section className="section-surface rounded-3xl p-6 md:p-8">
      <p className="label-caps text-sm text-[#7D000F]">{history ? "Booking history" : "My Booking"}</p>
      <h1 className="mt-2 text-3xl font-bold">{history ? "ประวัติการจอง" : "การจองของฉัน"}</h1>
      <p className="mt-3">{user?.name ?? "เลือกบัญชีสาธิตเพื่อดูการจอง"} • ข้อมูลจำลองในเบราว์เซอร์นี้</p>
      <div className="mt-4 flex gap-4"><Link href="/find-spot" className="underline">จองที่จอด</Link><Link href={history ? "/my-booking" : "/history"} className="underline">{history ? "การจองปัจจุบัน" : "ดูประวัติ"}</Link></div>
    </section>
    {loading ? <p className="mt-5">กำลังโหลด…</p> : !bookingEnabled ? <p className="mt-5">รอเชื่อมบริการจองจริง</p> : !user ? <Link href="/login" className="primary-cta mt-5 inline-block rounded-xl px-5 py-3">เลือกบัญชีสาธิต</Link> : <>
      {bookingError && <p role="alert">{bookingError} <button onClick={() => void refresh()} className="underline">ลองใหม่</button></p>}
      {message && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-4">{message}</p>}
      {!bookingError && bookings.length === 0 && <p className="mt-6 rounded-2xl bg-white p-6">{history ? "ยังไม่มีประวัติการจอง" : "ไม่มีการจองที่ยังไม่สิ้นสุด"}</p>}
      <div className="mt-5 grid gap-4 md:grid-cols-2">{bookings.map(booking => {
        const future = Date.parse(booking.startsAt) > now;
        const ended = booking.status === "expired" || (booking.status === "confirmed" && Date.parse(booking.expiresAt) <= now);
        const active = booking.status === "confirmed" && !ended;
        return <article key={booking.id} className="card-surface rounded-2xl p-5">
          <p className="text-sm text-[#59413F]">โซน {booking.zoneId} • {booking.vehicleType === "car" ? "รถยนต์" : "มอเตอร์ไซค์"}</p>
          <h2 className="mt-2 text-2xl font-bold text-[#7D000F]">{booking.slotId}</h2>
          <p className="mt-2 font-semibold">{booking.status === "cancelled" ? "ยกเลิกแล้ว" : ended ? "หมดอายุแล้ว" : future ? "จองล่วงหน้า" : "อยู่ในช่วงเวลาจอง"}</p>
          <p className="mt-3 text-sm">เริ่ม {formatDate(booking.startsAt)}<br />สิ้นสุด {formatDate(booking.expiresAt)}</p>
          {active && <><p className="mt-3 text-lg tabular-nums">{future ? "เริ่มใน" : "เหลือเวลา"} {countdown(Date.parse(future ? booking.startsAt : booking.expiresAt) - now)}</p>
            <button disabled={busy !== null} onClick={() => void cancel(booking.id)} className="mt-4 rounded-xl border border-[#7D000F] px-4 py-2 text-[#7D000F] disabled:opacity-50">{busy === booking.id ? "กำลังยกเลิก…" : "ยกเลิกการจอง"}</button></>}
          <Link href={`/zone/${booking.zoneId}`} className="ml-3 inline-block underline">ดูโซน</Link>
        </article>;
      })}</div>
      {history && <section className="mt-8"><h2 className="text-2xl font-bold">เหตุการณ์การจอง</h2><p className="mt-2 text-sm">ประวัตินี้ไม่ใช่หลักฐานว่ามีรถเข้าจอดจริง</p>
        <ol className="mt-4 space-y-3">{events.map(event => <li key={event.id} className="rounded-xl bg-white p-4">{event.type === "created" ? "สร้างการจอง" : event.type === "cancelled" ? "ยกเลิกการจอง" : "การจองหมดอายุ"} • {event.slotId}<span className="mt-1 block text-sm text-[#59413F]">{formatDate(event.timestamp)}</span></li>)}</ol>
      </section>}
    </>}
  </PageContainer></main>;
}
