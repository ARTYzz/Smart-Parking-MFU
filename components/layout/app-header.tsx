"use client";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";
import { UserAvatar } from "./user-avatar";
import { useCallback, useRef, useState } from "react";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { ProfileDrawer } from "./profile-drawer";
import { useApp } from "@/components/providers/app-provider";
import { usePathname } from "next/navigation";
import { parkingMode } from "@/lib/services";
import { Home, Map, Search, Ticket, Car, History, Bell, Menu, X } from "lucide-react";
import { DemoControls } from "./demo-controls";
const navigation = [
  ["/", "หน้าหลัก", "Overview", Home],
  ["/parking-zones", "พื้นที่จอดทั้งหมด", "Parking zones", Map],
  ["/find-spot", "ค้นหาและจอง", "Find and reserve", Search],
  ["/my-booking", "การจองของฉัน", "My bookings", Ticket],
  ["/my-vehicle", "รถของฉัน", "My vehicles", Car],
  ["/history", "ประวัติการจอง", "Booking history", History],
  ["/notifications", "การแจ้งเตือน", "Notifications", Bell],
] as const;
import { LanguageSwitcher } from "./language-switcher";

export function AppHeader() {
  const { t, language } = useLanguage();
  const { user } = useApp();
  const profileTrigger = useRef<HTMLButtonElement>(null);
  const [panel, setPanel] = useState<"profile" | "notifications" | null>(null);
  const close = useCallback(() => setPanel(null), []);
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const active = path.startsWith("/zone/") ? "/parking-zones" : path;
  const title = navigation.find(([href]) => href === active);
  const nav = <><Link href="/" className="brand"><b>P</b><span>MFU Parking<small>SMART PARKING</small></span></Link><nav className="side-links">{navigation.map(([href, th, en, Icon]) =>
    <Link key={href} href={href} aria-current={href === active ? "page" : undefined} onClick={() => dialog.current?.close()}><Icon size={18}/>{language === "th" ? th : en}</Link>)}</nav><div className="side-account"><UserAvatar user={user}/><strong>{user?.name}</strong></div></>;
  return <header className="app-toolbar">
    <aside className="desktop-side">{nav}</aside>
    <dialog ref={dialog} className="mobile-side"><button aria-label={language === "th" ? "ปิด" : "Close"} onClick={() => dialog.current?.close()}><X/></button>{nav}</dialog>
    <div className="toolbar-inner"><button className="menu-trigger" aria-label={t("เมนูหลัก")} onClick={() => dialog.current?.showModal()}><Menu/></button>
    <span className="crumb"><span className="crumb-label">MFU Smart Parking　/　</span><strong>{title?.[language === "th" ? 1 : 2]}</strong></span>
      <div className="relative flex items-center gap-3 justify-self-end">
        <details className="source-menu"><summary>{parkingMode === "mock" ? "● DEMO DATA" : "● API"}</summary><DemoControls/></details>
        <NotificationBell open={panel === "notifications"} onToggle={() => setPanel(value => value === "notifications" ? null : "notifications")} onClose={close} />
        <LanguageSwitcher />
        <button ref={profileTrigger} aria-label={t(`เปิดเมนูบัญชี ${user?.name ?? "ผู้เยี่ยมชม"}`)} aria-haspopup="dialog" aria-expanded={panel === "profile"} onClick={() => setPanel("profile")} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7D000F] font-bold text-white shadow-sm ring-2 ring-white hover:bg-[#A01D22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D000F]"><UserAvatar user={user} /></button>
      </div>

    </div>
    {t(panel === "profile" && <ProfileDrawer onClose={close} returnFocus={profileTrigger} />)}
  </header>;
}

