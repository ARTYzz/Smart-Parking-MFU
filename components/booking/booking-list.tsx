"use client";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { bookingService, parkingMode } from "@/lib/services";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";

const formatDate = (value: string, locale: string) => new Date(value).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
function countdown(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(seconds / 3600).toString().padStart(2, "0")}:${Math.floor(seconds % 3600 / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
export function BookingList({ history = false }: { history?: boolean }) {
  const { t, locale, language } = useLanguage();
  const { user, loading, bookingSnapshot, bookingError, now, refresh } = useApp();
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const mine = bookingSnapshot.bookings.filter(b => b.userId === user?.id);
  const bookings = mine.filter(b => !history && b.status === "confirmed").sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const events = bookingSnapshot.events.filter(e => e.userId === user?.id).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  async function cancel(id: string) {
    if (!user || !window.confirm(locale.startsWith("th") ? "ยืนยันยกเลิกการจองนี้?" : "Cancel this booking?")) return;
    setBusy(id); setMessage("");
    try { await bookingService.cancel(id, user.id); setMessage("ยกเลิกแล้ว ช่องพร้อมจองสำหรับช่วงเวลานี้อีกครั้ง"); }
    catch (error) { setMessage(error instanceof Error ? error.message : "ยกเลิกไม่สำเร็จ"); }
    finally { await refresh(); setBusy(null); }
  }
  return <main><AppHeader /><PageContainer>
    <section className="page-intro">
      <p className="label-caps text-sm text-[#7D000F]">{t(history ? "Booking history" : "My Booking")}</p>
      <h1 className="mt-2 text-3xl font-bold">{t(history ? "ประวัติการจอง" : "การจองของฉัน")}</h1>
      <p className="data-notice mt-5">{user?.name ?? (language === "th" ? "เข้าสู่ระบบเพื่อดูการจอง" : "Sign in to see your bookings")}{parkingMode === "mock" && t(" • ข้อมูลจำลองในเบราว์เซอร์นี้")}</p>
      <div className="mt-4 flex gap-4"><Link href="/find-spot" className="primary-cta rounded-xl px-4 py-2 text-sm font-bold">{t("จองที่จอด")}</Link><Link href={history ? "/my-booking" : "/history"} className="underline">{t(history ? "การจองปัจจุบัน" : "ดูประวัติ")}</Link></div>
    </section>
    {t(loading ? <p className="mt-5">{t("กำลังโหลด…")}</p> : !user ? <Link href="/login" className="primary-cta mt-5 inline-block rounded-xl px-5 py-3">{language === "th" ? "เข้าสู่ระบบ" : "Sign in"}</Link> : <>
      {t(bookingError && <p role="alert">{t(bookingError)} <button onClick={() => void refresh()} className="underline">{t("ลองใหม่")}</button></p>)}
      {t(message && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-4">{t(message)}</p>)}
      {t(!history && !bookingError && bookings.length === 0 && <p className="mt-6 rounded-2xl bg-white p-6">{t(history ? "ยังไม่มีประวัติการจอง" : "ไม่มีการจองที่ยังไม่สิ้นสุด")}</p>)}
      <div className="mt-5 grid gap-4">{t(bookings.map(booking => {
        const future = Date.parse(booking.startsAt) > now;
        const ended = booking.status === "expired" || (booking.status === "confirmed" && Date.parse(booking.expiresAt) <= now);
        const active = booking.status === "confirmed" && !ended;
        return <div key={booking.id} className="dashboard-panels"><article className="card-surface p-5">
          <h2 className="mb-4 font-bold">{language === "th" ? "รายการจอง" : "Reservation"}</h2>
          <div className="campus-hero rounded-xl p-5"><p className="text-sm">{t("โซน ")}{t(booking.zoneId)}{t(" • ")}{t(booking.vehicleType === "car" ? "รถยนต์" : "มอเตอร์ไซค์")}</p>
          <h2 className="mt-2 text-2xl font-bold text-white">{t(booking.slotId)}</h2>
          <p className="mt-2 font-semibold">{t(booking.status === "cancelled" ? "ยกเลิกแล้ว" : ended ? "หมดอายุแล้ว" : future ? "จองล่วงหน้า" : "อยู่ในช่วงเวลาจอง")}</p>
          <p className="mt-3 text-sm">{t("เริ่ม ")}{t(formatDate(booking.startsAt, locale))}<br />{t("สิ้นสุด ")}{t(formatDate(booking.expiresAt, locale))}</p></div>
          {t(active && <>
            <button disabled={busy !== null} onClick={() => void cancel(booking.id)} className="mt-4 rounded-xl border border-[#7D000F] px-4 py-2 text-[#7D000F] disabled:opacity-50">{t(busy === booking.id ? "กำลังยกเลิก…" : "ยกเลิกการจอง")}</button></>)}
          <Link href={`/zone/${booking.zoneId}`} className="ml-3 inline-block underline">{t("ดูโซน")}</Link>
        </article>
        <aside className="card-surface p-5">
          <h2 className="font-bold">{t(future ? "เริ่มใน" : "เหลือเวลา")}</h2>
          <p className="mt-4 text-4xl font-bold tabular-nums">{countdown(Date.parse(future ? booking.startsAt : booking.expiresAt) - now)}</p>
          <p className="data-notice mt-5">{language === "th" ? "เวลาจองสิ้นสุดไม่ได้ยืนยันว่ารถออกจากพื้นที่แล้ว" : "Reservation expiry does not confirm that the vehicle has left."}</p>
        </aside></div>;
      }))}</div>
      {!history && events.length > 0 && <section className="card-surface mt-5 p-5">
        <div className="flex justify-between gap-3"><h2 className="font-bold">{language === "th" ? "รายการที่ผ่านมา" : "Recent activity"}</h2><Link href="/history" className="text-sm font-semibold text-[#7d000f]">{t("ดูประวัติ")} →</Link></div>
        <ul className="mt-3 divide-y divide-slate-100">{events.slice(0, 3).map(event => <li key={event.id} className="flex justify-between gap-3 py-3 text-sm"><span>{t(event.type === "created" ? "สร้างการจอง" : event.type === "cancelled" ? "ยกเลิกการจอง" : "การจองหมดอายุ")} · {event.slotId}</span><time dateTime={event.timestamp} className="text-slate-600">{formatDate(event.timestamp, locale)}</time></li>)}</ul>
      </section>}
      {history && <>
        <div className="my-5 grid grid-cols-3 gap-3">
          {[[language === "th" ? "ทั้งหมด" : "All events", events.length], [language === "th" ? "หมดเวลา" : "Expired", events.filter(e => e.type === "expired").length], [language === "th" ? "ยกเลิก" : "Cancelled", events.filter(e => e.type === "cancelled").length]].map(([label,count]) => <article key={label} className="card-surface p-4"><p className="text-xs text-slate-600">{label}</p><strong className="mt-3 block text-2xl">{count}</strong></article>)}
        </div>
        <section className="card-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold">{t("เหตุการณ์การจอง")}</h2>
            <select aria-label={language === "th" ? "ประเภทเหตุการณ์" : "Event type"} value={filter} onChange={e => setFilter(e.target.value)} className="rounded-lg border border-slate-200 p-2 text-sm">
              {[["all","ทุกเหตุการณ์","All events"],["created","สร้างการจอง","Created"],["cancelled","ยกเลิก","Cancelled"],["expired","หมดเวลา","Expired"]].map(([key,th,en]) => <option key={key} value={key}>{language === "th" ? th : en}</option>)}
            </select>
          </div>
          <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>
            {(language === "th" ? ["รายการ", "เวลา", "ช่องจอด", "เหตุการณ์"] : ["Booking", "Time", "Space", "Event"]).map(label => <th key={label} scope="col" className="p-3">{label}</th>)}
          </tr></thead><tbody>{events.filter(e => filter === "all" || e.type === filter).map(event => <tr key={event.id} className="border-t border-slate-100">
            <td className="p-3 font-semibold">{event.bookingId}</td><td className="p-3">{formatDate(event.timestamp, locale)}</td><td className="p-3">{event.slotId}</td><td className="p-3">{t(event.type === "created" ? "สร้างการจอง" : event.type === "cancelled" ? "ยกเลิกการจอง" : "การจองหมดอายุ")}</td>
          </tr>)}</tbody></table></div>
          {!events.some(e => filter === "all" || e.type === filter) && <p className="mt-4 text-sm text-slate-600">{t("ยังไม่มีประวัติการจอง")}</p>}
        </section>
      </>}
    </>)}
  </PageContainer></main>;
}
