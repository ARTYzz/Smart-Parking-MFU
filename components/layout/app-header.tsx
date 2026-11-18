"use client";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";
import { UserAvatar } from "./user-avatar";
import { useCallback, useRef, useState } from "react";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { ProfileDrawer } from "./profile-drawer";
import { useApp } from "@/components/providers/app-provider";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { LanguageSwitcher } from "./language-switcher";

export function AppHeader() {
  const { t } = useLanguage();
  const { user } = useApp();
  const profileTrigger = useRef<HTMLButtonElement>(null);
  const [panel, setPanel] = useState<"profile" | "notifications" | null>(null);
  const close = useCallback(() => setPanel(null), []);
  return <header className="glass-panel sticky top-0 z-30">
    <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-5 py-4 md:px-8">
      <Link href="/" className="min-w-0"><p className="label-caps text-[0.6rem] font-semibold text-[#7D000F]/80 md:text-[0.7rem]">{t("Mae Fah Luang University")}</p><h1 className="display-font mt-1 text-lg font-extrabold text-[#191C1D] md:text-2xl">{t(APP_NAME)}</h1><p className="mt-1 hidden text-sm text-[#59413F] sm:block">{t(APP_DESCRIPTION)}</p></Link>
      <div className="relative flex items-center gap-3 justify-self-end">
        <NotificationBell open={panel === "notifications"} onToggle={() => setPanel(value => value === "notifications" ? null : "notifications")} onClose={close} />
        <LanguageSwitcher />
        <button ref={profileTrigger} aria-label={t(`เปิดเมนูบัญชี ${user?.name ?? "ผู้เยี่ยมชม"}`)} aria-haspopup="dialog" aria-expanded={panel === "profile"} onClick={() => setPanel("profile")} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7D000F] font-bold text-white shadow-sm ring-2 ring-white hover:bg-[#A01D22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D000F]"><UserAvatar user={user} /></button>
      </div>
      <nav aria-label={t("เมนูหลัก")} className="col-span-2 flex flex-wrap gap-2 text-sm font-semibold">{t([{ href: "/", label: "Dashboard" }, { href: "/find-spot", label: "Quick Finder" }, { href: "/parking-zones", label: "Parking Zones" }].map(item => <Link key={item.href} href={item.href} onClick={close} className="rounded-full bg-white/70 px-4 py-2 text-[#7D000F] hover:bg-white">{t(item.label)}</Link>))}</nav>
    </div>
    {t(panel === "profile" && <ProfileDrawer onClose={close} returnFocus={profileTrigger} />)}
  </header>;
}

