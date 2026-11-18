"use client";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { bookingEnabled, notificationService } from "@/lib/services";

export function NotificationBell({ open, onToggle, onClose }: { open: boolean; onToggle: () => void; onClose: () => void }) {
  const { t, locale } = useLanguage();
  const { user, loading, notificationSnapshot, notificationError, refreshNotifications } = useApp();
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const notifications = notificationSnapshot.notifications.filter(n => n.userId === user?.id);
  const count = notifications.filter(n => n.readAt === null).length;
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const outside = (event: PointerEvent) => { if (!wrapper.current?.contains(event.target as Node)) onClose(); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); onClose(); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open, onClose]);
  async function read(id?: string) {
    if (!user) return;
    setBusy(true); setMessage("");
    try { if (id) await notificationService.markRead(id, user.id); else await notificationService.markAllRead(user.id); await refreshNotifications(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "ดำเนินการไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  return <div ref={wrapper}>
    <button ref={trigger} onClick={onToggle} aria-label={t(notificationError ? "การแจ้งเตือน โหลดไม่สำเร็จ" : `การแจ้งเตือน ยังไม่อ่าน ${count} ข้อความ`)} aria-expanded={open} aria-controls="notification-dropdown" aria-haspopup="dialog" className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#7D000F] shadow-sm hover:bg-[#7D000F]/5 focus-visible:outline-2 focus-visible:outline-[#7D000F]">
      <Bell className="h-5 w-5" />{t((notificationError || count > 0) && <span aria-hidden="true" className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#7D000F] px-1 text-center text-[10px] font-bold leading-5 text-white">{t(notificationError ? "!" : count > 99 ? "99+" : count)}</span>)}
    </button>
    {t(open && <section id="notification-dropdown" role="dialog" aria-label={t("รายการแจ้งเตือน")} className="absolute right-0 top-full z-40 mt-3 w-[min(24rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-black/5 bg-white text-[#191C1D] shadow-xl">
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3"><h2 className="font-bold">{t("การแจ้งเตือน ")}<span className="text-sm font-normal text-[#59413F]">{t("(")}{t(count)}{t(" ยังไม่อ่าน)")}</span></h2><button ref={closeButton} onClick={() => { onClose(); trigger.current?.focus(); }} aria-label={t("ปิดการแจ้งเตือน")} className="rounded-full p-2 hover:bg-black/5"><X className="h-4 w-4" /></button></div>
      <div className="max-h-[min(55dvh,28rem)] overflow-y-auto overscroll-contain">
        {t(loading ? <p className="p-5 text-sm">{t("กำลังโหลด…")}</p> : !bookingEnabled ? <p className="p-5 text-sm">{t("รอเชื่อมบริการแจ้งเตือนจริง")}</p> : !user ? <div className="p-5 text-sm"><p>{t("เลือกบัญชีเพื่อดูข้อความของคุณ")}</p><Link href="/login" onClick={onClose} className="mt-3 inline-block font-semibold text-[#7D000F] underline">{t("เลือกบัญชีสาธิต")}</Link></div> : notificationError ? <p role="alert" className="p-5 text-sm">{t(notificationError)} <button onClick={() => void refreshNotifications()} className="underline">{t("ลองใหม่")}</button></p> : notifications.length === 0 ? <p className="p-6 text-sm text-[#59413F]">{t("ยังไม่มีการแจ้งเตือน")}</p> : notifications.slice(0, 6).map(n => <article key={n.id} className={`border-b border-black/5 p-4 ${n.readAt === null ? "bg-[#7D000F]/[0.03]" : ""}`}>
          <div className="flex items-start gap-2"><span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt === null ? "bg-[#7D000F]" : "bg-transparent"}`} /><div className="min-w-0 flex-1"><h3 className="text-sm font-semibold">{t(n.title)}</h3><p className="mt-1 text-xs text-[#59413F]">{t(n.body)}</p><p className="mt-2 text-[11px] text-[#59413F]">{t(new Date(n.createdAt).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" }))}{t(" • ")}{t(n.readAt === null ? "ยังไม่อ่าน" : "อ่านแล้ว")}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs"><Link onClick={onClose} href={n.type.startsWith("zone-") && n.zoneId ? `/zone/${encodeURIComponent(n.zoneId)}` : n.type === "booking-expired" || n.type === "booking-cancelled" ? "/history" : "/my-booking"} className="font-semibold text-[#7D000F] underline">{t("ดูรายละเอียด")}</Link>{t(n.readAt === null && <button disabled={busy} onClick={() => void read(n.id)} className="underline disabled:opacity-50">{t("อ่านแล้ว")}</button>)}</div>
          </div></div>
        </article>))}
      </div>
      {t(message && <p role="alert" className="px-4 py-2 text-xs text-red-800">{t(message)}</p>)}
      <div className="flex items-center justify-between gap-3 bg-[#F8F9FA] px-4 py-3 text-xs"><button disabled={busy || count === 0 || Boolean(notificationError)} onClick={() => void read()} className="inline-flex items-center gap-1 text-[#7D000F] disabled:opacity-40"><CheckCheck className="h-4 w-4" />{t("อ่านทั้งหมด")}</button><Link href="/notifications" onClick={onClose} className="font-semibold text-[#7D000F] underline">{t("ดูทั้งหมด / ติดตามโซน")}</Link></div>
    </section>)}
  </div>;
}
