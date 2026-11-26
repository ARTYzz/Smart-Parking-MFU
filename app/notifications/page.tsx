"use client";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";
import { useState } from "react";
import { Bell, CheckCheck, MapPin } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { useApp } from "@/components/providers/app-provider";
import { notificationService, parkingMode } from "@/lib/services";

export default function NotificationsPage() {
  const { t, locale, language } = useLanguage();
  const { user, zones, loading, notificationSnapshot, notificationError, refreshNotifications } = useApp();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const notifications = notificationSnapshot.notifications.filter(n => n.userId === user?.id);
  const unread = notifications.filter(n => n.readAt === null).length;
  const visible = notifications.filter(n => !unreadOnly || n.readAt === null);
  async function act(work: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await work(); await refreshNotifications(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "ดำเนินการไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  return <main><AppHeader /><PageContainer>
    <section className="page-intro">
      <p className="label-caps text-sm font-semibold text-[#7D000F]">{t("Notification Center")}</p>
      <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold"><Bell />{t("การแจ้งเตือน")}</h1>
      <p className="mt-3">{t("ข่าวการจองและโซนที่คุณติดตาม • ")}{user?.name ?? t("ผู้เยี่ยมชม")}</p>
      <p className="mt-2 text-sm text-[#59413F]">{parkingMode === "mock" ? t("แจ้งเตือนภายในเว็บสาธิตเท่านั้น ขณะปิดเว็บจะไม่มี Push การจองที่หมดอายุจะแสดงเมื่อเปิดกลับมา")
        : language === "th" ? "การแจ้งเตือนจะแสดงในเว็บนี้ รวมถึงรายการจองที่หมดอายุเมื่อเปิดเว็บกลับมา" : "Notifications appear here, including expired bookings when you return."}</p>
    </section>
    {t(loading ? <p className="mt-6">{t("กำลังโหลด…")}</p> : !user ? <Link href="/login" className="primary-cta mt-6 inline-block rounded-xl px-5 py-3">{language === "th" ? "เข้าสู่ระบบเพื่อดูการแจ้งเตือน" : "Sign in to see notifications"}</Link> :
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <section className="card-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2"><button onClick={() => setUnreadOnly(false)} aria-pressed={!unreadOnly} className={`rounded-full px-4 py-2 ${!unreadOnly ? "bg-[#7D000F] text-white" : "bg-white"}`}>{t("ทั้งหมด ")}{t(notifications.length)}</button><button onClick={() => setUnreadOnly(true)} aria-pressed={unreadOnly} className={`rounded-full px-4 py-2 ${unreadOnly ? "bg-[#7D000F] text-white" : "bg-white"}`}>{t("ยังไม่อ่าน ")}{t(unread)}</button></div>
          <button disabled={busy || unread === 0 || Boolean(notificationError)} onClick={() => void act(() => notificationService.markAllRead(user.id))} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[#7D000F] disabled:opacity-50"><CheckCheck className="h-4 w-4" />{t("อ่านทั้งหมด")}</button>
        </div>
        {t(notificationError && <p role="alert" className="mt-4">{t(notificationError)} <button onClick={() => void refreshNotifications()} className="underline">{t("ลองใหม่")}</button></p>)}
        {t(message && <p role="alert" className="mt-4 text-red-800">{t(message)}</p>)}
        {t(!notificationError && visible.length === 0 && <div className="card-surface mt-5 rounded-2xl p-8"><h2 className="text-xl font-bold">{t(unreadOnly ? "อ่านข้อความครบแล้ว" : "ยังไม่มีการแจ้งเตือน")}</h2><p className="mt-2 text-sm">{t("เมื่อจองที่จอดหรือโซนที่ติดตามเปลี่ยนสถานะ ข้อความจะแสดงที่นี่")}</p></div>)}
        <div className="mt-5 space-y-3">{t(visible.map(n => <article key={n.id} className={`card-surface rounded-2xl border-l-4 p-5 ${n.readAt === null ? "border-[#7D000F]" : "border-transparent"}`}>
          <div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold">{t(n.title)}</h2><span className="whitespace-nowrap text-xs text-[#7D000F]">{t(n.readAt === null ? "ยังไม่อ่าน" : "อ่านแล้ว")}</span></div>
          <p className="mt-2 text-sm text-[#59413F]">{t(n.body)}</p>
          <time className="mt-2 block text-xs text-[#59413F]" dateTime={n.createdAt}>{t(new Date(n.createdAt).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" }))}</time>
          <div className="mt-4 flex flex-wrap gap-4"><Link className="text-sm font-semibold underline" href={n.type.startsWith("zone-") && n.zoneId ? `/zone/${encodeURIComponent(n.zoneId)}` : n.type === "booking-cancelled" || n.type === "booking-expired" ? "/history" : "/my-booking"}>{t("ดูรายละเอียด")}</Link>
            {t(n.readAt === null && <button disabled={busy} onClick={() => void act(() => notificationService.markRead(n.id, user.id))} className="text-sm text-[#7D000F] underline disabled:opacity-50">{t("ทำเครื่องหมายว่าอ่านแล้ว")}</button>)}
          </div>
        </article>))}</div>
      </section>
      <aside className="card-surface h-fit rounded-3xl p-5 md:p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold"><MapPin className="h-5 w-5" />{t("ติดตามโซน")}</h2>
        <p className="mt-3 text-sm text-[#59413F]">{t("รับข้อความเมื่อช่องพร้อมจองใกล้เต็ม (เหลือไม่เกิน 30%) หรือเต็ม รวมผลการจองปัจจุบัน")}</p>
        <p className="mt-2 text-xs text-[#59413F]">{t("หากโซนใกล้เต็มหรือเต็มอยู่แล้ว จะมีข้อความแรกเมื่อติดตาม ไม่แจ้งซ้ำจนกว่าสถานะจะเปลี่ยน")}</p>
        <div className="mt-4 space-y-2">{t(zones.map(zone => <label key={zone.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-[#F3F4F5] p-3"><span className="flex items-center gap-3"><strong className="zone-icon">{zone.id}</strong>{t(zone.name)}</span><input type="checkbox" aria-label={t(`ติดตามโซน ${zone.id}`)} checked={notificationSnapshot.userId === user.id && notificationSnapshot.followedZoneIds.includes(zone.id)} disabled={busy || Boolean(notificationError)} onChange={e => { const follow = e.target.checked; void act(() => notificationService.followZone(zone.id, follow, user.id)); }} role="switch" className="zone-watch-switch" /></label>))}</div>
        <p className="mt-4 text-xs text-[#59413F]">{parkingMode === "mock" ? t("หยุดติดตามแล้วข้อความเดิมยังอยู่ โหมดสาธิตตรวจสถานะขณะเปิดเว็บ และไม่สามารถทราบการเปลี่ยนแปลงที่พลาดไประหว่างปิดเว็บ")
          : language === "th" ? "ระบบตรวจสถานะโซนที่ติดตามขณะเปิดเว็บ" : "Followed zones are checked while the site is open."}</p>
      </aside>
    </div>)}
  </PageContainer></main>;
}

