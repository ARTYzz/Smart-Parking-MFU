"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { CalendarCheck, Car, Check, History, LogOut, UserRound, X } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { authMode } from "@/lib/services";
import { demoAccounts } from "@/lib/services/mock";

const roleLabels = { student: "นักศึกษา", staff: "บุคลากร", lecturer: "อาจารย์", admin: "ผู้ดูแลระบบ" };
export function ProfileDrawer({ onClose, returnFocus }: { onClose: () => void; returnFocus: RefObject<HTMLButtonElement | null> }) {
  const { user, signIn, signOut, loading } = useApp();
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const element = dialog.current;
    const returnTarget = returnFocus.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previousOverflow; if (returnTarget?.isConnected) returnTarget.focus(); };
  }, [returnFocus]);
  async function select(id: string) {
    setBusy(true); setMessage("");
    try { await signIn(id); }
    catch (error) { setMessage(error instanceof Error ? error.message : "สลับบัญชีไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setMessage("");
    try { await signOut(); onClose(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "ออกจากระบบไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  return createPortal(<dialog ref={dialog} aria-labelledby="profile-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-[#191C1D] backdrop:bg-black/35">
    <aside className="ml-auto flex h-full w-[min(24rem,92vw)] flex-col bg-[#F8F9FA] shadow-2xl">
      <div className="flex items-center justify-between border-b border-black/5 px-6 py-5"><h2 id="profile-title" className="text-xl font-bold">บัญชีของฉัน</h2><button autoFocus onClick={onClose} aria-label="ปิดเมนูบัญชี" className="rounded-full p-2 hover:bg-black/5"><X className="h-5 w-5" /></button></div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#7D000F] text-xl font-bold text-white">{user ? user.role.slice(0, 1).toUpperCase() : <UserRound />}</div><div><p className="font-bold">{user?.name ?? "ผู้เยี่ยมชม"}</p><p className="mt-1 text-sm text-[#59413F]">{user ? roleLabels[user.role] : "เลือกบัญชีเพื่อเริ่มใช้งาน"}</p></div></div>
        <nav aria-label="เมนูส่วนตัว" className="mt-6 space-y-2">{[
          { href: "/my-booking", label: "การจองของฉัน", Icon: CalendarCheck },
          { href: "/my-vehicle", label: "ยานพาหนะของฉัน", Icon: Car },
          { href: "/history", label: "ประวัติการใช้งาน", Icon: History },
        ].map(({ href, label, Icon }) => <Link key={href} href={href} onClick={onClose} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-medium hover:bg-[#FED488]/40"><Icon className="h-5 w-5 text-[#7D000F]" />{label}</Link>)}</nav>
        <section className="mt-8"><h3 className="font-bold">{user ? "สลับบัญชีสาธิต" : "เลือกบัญชีสาธิต"}</h3><p className="mt-2 text-xs text-[#59413F]">บัญชีสมมติสำหรับทดสอบ ไม่ใช้บัญชีมหาวิทยาลัย</p>
          {authMode !== "mock" ? <p className="mt-4 text-sm">ระบบ REG ยังไม่พร้อมใช้งาน</p> : <div className="mt-4 space-y-2">{demoAccounts.map(account => <button key={account.id} disabled={busy || loading} aria-pressed={user?.id === account.id} onClick={() => void select(account.id)} className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left disabled:opacity-50 ${user?.id === account.id ? "border-[#7D000F]/30 bg-[#7D000F]/5" : "border-transparent bg-white hover:border-[#7D000F]/20"}`}><span><span className="block text-sm font-semibold">{account.name}</span><span className="text-xs text-[#59413F]">{roleLabels[account.role]}</span></span>{user?.id === account.id && <Check className="h-5 w-5 text-[#7D000F]" />}</button>)}</div>}
        </section>
        {message && <p role="alert" className="mt-4 text-sm text-red-800">{message}</p>}
      </div>
      {user && <div className="border-t border-black/5 p-6"><button disabled={busy} onClick={() => void logout()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#7D000F]/20 px-4 py-3 font-semibold text-[#7D000F] disabled:opacity-50"><LogOut className="h-5 w-5" />ออกจากระบบ</button></div>}
    </aside>
  </dialog>, document.body);
}
